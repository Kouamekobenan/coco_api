import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging, type MulticastMessage } from 'firebase-admin/messaging';
import {
  INotificationChannelStrategy,
  NotificationPayload,
  NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';

@Injectable()
export class FcmPushStrategy implements INotificationChannelStrategy, OnModuleInit {
  private readonly logger = new Logger(FcmPushStrategy.name);
  public readonly channel = NotificationChannel.PUSH;
  private firebaseApp: App | null = null;
  private messaging: Messaging | null = null;

  constructor(private readonly configService: ConfigService) {}

  public onModuleInit(): void {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (getApps().length > 0) {
      this.firebaseApp = getApps()[0];
      this.messaging = getMessaging(this.firebaseApp);
      this.logger.log(`[Push FCM] Application Firebase réutilisée (${this.firebaseApp.name})`);
      return;
    }

    try {
      const explicitPath = this.configService.get<string>('FIREBASE_CREDENTIALS_PATH');
      const inlineJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');

      let serviceAccount: Record<string, unknown> | null = null;

      if (inlineJson && inlineJson.trim().length > 0) {
        const raw = inlineJson.trim();
        const decoded = raw.startsWith('{')
          ? raw
          : Buffer.from(raw, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
        this.logger.log('[Push FCM] Compte de service Firebase chargé depuis la variable FIREBASE_SERVICE_ACCOUNT_JSON');
      } else {
        const resolvedPath = this.resolveCredentialsPath(explicitPath);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const raw = fs.readFileSync(resolvedPath, 'utf-8');
          serviceAccount = JSON.parse(raw);
          this.logger.log(`[Push FCM] Clé de service Firebase chargée depuis le fichier: ${resolvedPath}`);
        }
      }

      if (serviceAccount) {
        if (typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        const projectId =
          (serviceAccount.project_id as string) || this.configService.get<string>('FCM_PROJECT_ID');
        this.firebaseApp = initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
        this.messaging = getMessaging(this.firebaseApp);
        this.logger.log(
          `[Push FCM] Initialisé avec succès via Firebase Admin SDK (Projet: ${projectId})`,
        );
      } else {
        this.logger.warn(
          '[Push FCM] Aucun compte de service Firebase détecté. Mode simulation actif (logs en console).',
        );
      }
    } catch (error) {
      this.logger.error(
        `[Push FCM] Échec de l'initialisation de Firebase Admin: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private resolveCredentialsPath(explicitPath?: string): string | null {
    const cwd = process.cwd();

    if (explicitPath) {
      const direct = path.isAbsolute(explicitPath) ? explicitPath : path.resolve(cwd, explicitPath);
      if (fs.existsSync(direct)) return direct;
    }

    // Recherche automatique dans src/common/
    const commonDir = path.resolve(cwd, 'src', 'common');
    if (fs.existsSync(commonDir)) {
      const files = fs.readdirSync(commonDir);
      const match = files.find((f) => f.includes('firebase-adminsdk') && f.endsWith('.json'));
      if (match) {
        return path.resolve(commonDir, match);
      }
      const standard = path.resolve(commonDir, 'firebase-service-account.json');
      if (fs.existsSync(standard)) {
        return standard;
      }
    }

    return null;
  }

  public async send(payload: NotificationPayload): Promise<NotificationSendResult> {
    const tokens = payload.pushTokens || [];

    if (tokens.length === 0) {
      this.logger.debug(
        `[Push FCM] Aucun token push enregistré pour l'utilisateur ${payload.userId}`,
      );
      return {
        channel: this.channel,
        success: true,
        messageId: 'no-token-skipped',
      };
    }

    // Mode simulation si Firebase n'est pas initialisé
    if (!this.messaging) {
      this.logger.log(
        `[Push FCM Simulé] Envoi push vers ${tokens.length} appareil(s) pour user ${payload.userId}: "${payload.title}"`,
      );
      return {
        channel: this.channel,
        success: true,
        messageId: `mock-fcm-${Date.now()}`,
      };
    }

    try {
      // Firebase data payload accepte uniquement des chaînes de caractères (Record<string, string>)
      const stringData: Record<string, string> = {};
      if (payload.data) {
        for (const [key, value] of Object.entries(payload.data)) {
          if (value !== undefined && value !== null) {
            stringData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
          }
        }
      }

      // Formatage du message multicast Firebase HTTP v1
      const multicastMessage: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(multicastMessage);

      if (response.failureCount > 0) {
        const firstError = response.responses.find((r) => !r.success)?.error;
        this.logger.warn(
          `[Push FCM] ${response.failureCount}/${tokens.length} envoi(s) ont échoué. Cause: ${firstError?.message ?? 'inconnue'}`,
        );
      }

      const isSuccess = response.successCount > 0;
      this.logger.log(
        `[Push FCM] Notification Push délivrée à ${response.successCount}/${tokens.length} appareil(s) pour user: ${payload.userId}`,
      );

      return {
        channel: this.channel,
        success: isSuccess,
        messageId: `fcm-multicast-${Date.now()}-${response.successCount}`,
        error: response.failureCount === tokens.length ? 'Tous les tokens ont échoué' : undefined,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[Push FCM] Erreur réseau FCM: ${errorMessage}`);
      return {
        channel: this.channel,
        success: false,
        error: errorMessage,
      };
    }
  }
}

