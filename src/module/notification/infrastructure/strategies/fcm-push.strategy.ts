import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import {
  INotificationChannelStrategy,
  NotificationPayload,
  NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';

@Injectable()
export class FcmPushStrategy implements INotificationChannelStrategy {
  private readonly logger = new Logger(FcmPushStrategy.name);
  public readonly channel = NotificationChannel.PUSH;

  constructor(private readonly configService: ConfigService) {}

  public async send(payload: NotificationPayload): Promise<NotificationSendResult> {
    const fcmServerKey = this.configService.get<string>('FCM_SERVER_KEY');
    const fcmProjectId = this.configService.get<string>('FCM_PROJECT_ID');
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

    if (!fcmServerKey && !fcmProjectId) {
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
      // Envoi réel FCM HTTP v1 / Legacy endpoint
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          registration_ids: tokens,
          notification: {
            title: payload.title,
            body: payload.body,
            sound: 'default',
          },
          data: payload.data ?? {},
          priority: 'high',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`[Push FCM] Réponse négative de Firebase: ${errorText}`);
        return {
          channel: this.channel,
          success: false,
          error: `FCM error status: ${response.status}`,
        };
      }

      this.logger.log(
        `[Push FCM] Notification Push délivrée à ${tokens.length} appareil(s) pour user: ${payload.userId}`,
      );

      return {
        channel: this.channel,
        success: true,
        messageId: `fcm-${Date.now()}`,
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
