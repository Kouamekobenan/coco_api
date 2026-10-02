import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import {
  INotificationChannelStrategy,
  NotificationPayload,
  NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';

@Injectable()
export class WhatsAppStrategy implements INotificationChannelStrategy {
  private readonly logger = new Logger(WhatsAppStrategy.name);
  public readonly channel = NotificationChannel.WHATSAPP;

  constructor(private readonly configService: ConfigService) {}

  public async send(payload: NotificationPayload): Promise<NotificationSendResult> {
    const token = this.configService.get<string>('WHATSAPP_API_TOKEN');
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const phone = payload.recipientPhone;

    if (!phone) {
      this.logger.debug(
        `[WhatsApp] Aucun numéro de téléphone disponible pour l'utilisateur ${payload.userId}`,
      );
      return {
        channel: this.channel,
        success: false,
        error: 'No phone number provided',
      };
    }

    // Normalisation du numéro pour WhatsApp (sans espaces ni signes +)
    const normalizedPhone = phone.replace(/[^0-9]/g, '');

    if (!token || !phoneNumberId) {
      this.logger.log(
        `[WhatsApp Simulé] Message vers ${phone} ("${payload.title}"): ${payload.body}`,
      );
      return {
        channel: this.channel,
        success: true,
        messageId: `mock-wa-${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: `*${payload.title}*\n\n${payload.body}`,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`[WhatsApp] Échec envoi WhatsApp Cloud API: ${errorText}`);
        return {
          channel: this.channel,
          success: false,
          error: `WhatsApp API status: ${response.status}`,
        };
      }

      const resData = (await response.json()) as { messages?: Array<{ id: string }> };
      const waMessageId = resData.messages?.[0]?.id || `wa-${Date.now()}`;

      this.logger.log(
        `[WhatsApp] Message envoyé avec succès vers ${phone} (MessageID: ${waMessageId})`,
      );

      return {
        channel: this.channel,
        success: true,
        messageId: waMessageId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[WhatsApp] Erreur connexion Meta WhatsApp API: ${errorMessage}`);
      return {
        channel: this.channel,
        success: false,
        error: errorMessage,
      };
    }
  }
}
