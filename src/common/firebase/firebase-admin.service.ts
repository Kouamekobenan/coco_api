import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth, type DecodedIdToken } from 'firebase-admin/auth';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: App | null = null;
  private auth: Auth | null = null;
  private messaging: Messaging | null = null;

  constructor(private readonly configService: ConfigService) {}

  public onModuleInit(): void {
    this.initialize();
  }

  public initialize(): void {
    if (getApps().length > 0) {
      this.firebaseApp = getApps()[0];
      this.auth = getAuth(this.firebaseApp);
      this.messaging = getMessaging(this.firebaseApp);
      this.logger.log(`[Firebase] Application réutilisée avec succès (${this.firebaseApp.name})`);
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
        this.logger.log('[Firebase] Compte de service chargé depuis FIREBASE_SERVICE_ACCOUNT_JSON');
      } else {
        const resolvedPath = this.resolveCredentialsPath(explicitPath);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const raw = fs.readFileSync(resolvedPath, 'utf-8');
          serviceAccount = JSON.parse(raw);
          this.logger.log(`[Firebase] Clé de service chargée depuis le fichier: ${resolvedPath}`);
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
        this.auth = getAuth(this.firebaseApp);
        this.messaging = getMessaging(this.firebaseApp);
        this.logger.log(
          `[Firebase] Initialisé avec succès via Firebase Admin SDK (Projet: ${projectId})`,
        );
      } else {
        this.logger.warn(
          '[Firebase] Aucun compte de service détecté. Firebase Admin opère en mode restreint.',
        );
      }
    } catch (error) {
      this.logger.error(
        `[Firebase] Échec de l'initialisation de Firebase Admin: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private resolveCredentialsPath(explicitPath?: string): string | null {
    const cwd = process.cwd();

    if (explicitPath) {
      const direct = path.isAbsolute(explicitPath) ? explicitPath : path.resolve(cwd, explicitPath);
      if (fs.existsSync(direct)) return direct;
    }

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

  public getApp(): App | null {
    return this.firebaseApp;
  }

  public getAuth(): Auth | null {
    return this.auth;
  }

  public getMessaging(): Messaging | null {
    return this.messaging;
  }

  /**
   * Vérifie cryptographiquement un Firebase ID Token (issu de Firebase Phone Auth ou Client SDK)
   * et renvoie les claims décodés incluant phone_number et uid.
   */
  public async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.auth) {
      // Si Firebase n'a pas pu être initialisé (ex: local sans credentials)
      throw new UnauthorizedException(
        "Le service d'authentification Firebase n'est pas initialisé sur le serveur.",
      );
    }

    try {
      return await this.auth.verifyIdToken(idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`[Firebase Auth] Rejet du jeton: ${message}`);
      throw new UnauthorizedException(`Jeton Firebase invalide ou expiré: ${message}`);
    }
  }
}
