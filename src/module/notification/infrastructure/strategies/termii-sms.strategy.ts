import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import {
  INotificationChannelStrategy,
  NotificationPayload,
  NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';

@Injectable()
export class TermiiSmsStrategy implements INotificationChannelStrategy {
  private readonly logger = new Logger(TermiiSmsStrategy.name);
  public readonly channel = NotificationChannel.SMS;

  constructor(private readonly configService: ConfigService) {}

  public async send(payload: NotificationPayload): Promise<NotificationSendResult> {
    const apiKey = this.configService.get<string>('TERMII_API_KEY');
    const senderId = this.configService.get<string>('TERMII_SENDER_ID', 'CocoSalons');
    const phone = payload.recipientPhone;

    if (!phone) {
      this.logger.debug(
        `[SMS Termii] Aucun numéro de téléphone disponible pour l'utilisateur ${payload.userId}`,
      );
      return {
        channel: this.channel,
        success: false,
        error: 'No phone number provided',
      };
    }

    // Normalisation format international (ex: 2250700000000)
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('00')) {
      formattedPhone = formattedPhone.substring(2);
    }
    // Si le numéro a 10 chiffres (format CI standard 07/05/01...), on ajoute l'indicatif 225 s'il manque
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('225')) {
      formattedPhone = `225${formattedPhone}`;
    }

    if (!apiKey) {
      this.logger.log(
        `[SMS Termii Simulé] SMS vers ${formattedPhone} [Sender: ${senderId}]: "${payload.title} - ${payload.body}"`,
      );
      return {
        channel: this.channel,
        success: true,
        messageId: `mock-sms-${Date.now()}`,
      };
    }

    try {
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          from: senderId,
          sms: `${payload.title}: ${payload.body}`,
          type: 'plain',
          channel: 'generic',
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`[SMS Termii] Échec d'envoi SMS: ${errorText}`);
        return {
          channel: this.channel,
          success: false,
          error: `Termii API status: ${response.status}`,
        };
      }

      const resData = (await response.json()) as { message_id?: string; code?: string };
      this.logger.log(
        `[SMS Termii] SMS transactionnel expédié avec succès à ${formattedPhone} (ID: ${resData.message_id || 'ok'})`,
      );

      return {
        channel: this.channel,
        success: true,
        messageId: resData.message_id || `sms-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[SMS Termii] Erreur passerelle Termii: ${errorMessage}`);
      return {
        channel: this.channel,
        success: false,
        error: errorMessage,
      };
    }
  }
}
