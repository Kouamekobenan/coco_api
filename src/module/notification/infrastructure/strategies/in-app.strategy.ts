import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from '../../domain/repositories/notification.repository.interface.js';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import {
  INotificationChannelStrategy,
  NotificationPayload,
  NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';

export const NOTIFICATION_REALTIME_PATTERNS = {
  RECEIVED: 'notification.received',
} as const;

@Injectable()
export class InAppStrategy implements INotificationChannelStrategy {
  private readonly logger = new Logger(InAppStrategy.name);
  public readonly channel = NotificationChannel.IN_APP;

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async send(payload: NotificationPayload): Promise<NotificationSendResult> {
    try {
      const entity = new NotificationEntity({
        userId: payload.userId,
        salonId: payload.salonId,
        title: payload.title,
        body: payload.body,
        channel: this.channel,
        data: payload.data,
      });

      const saved = await this.notificationRepo.create(entity);

      // Émission de l'événement temps réel pour propagation WebSocket immédiate
      this.eventEmitter.emit(NOTIFICATION_REALTIME_PATTERNS.RECEIVED, {
        userId: payload.userId,
        salonId: payload.salonId,
        notification: saved.toJSON(),
      });

      this.logger.debug(
        `[In-App] Notification créée et diffusée pour user: ${payload.userId} (ID: ${saved.id})`,
      );

      return {
        channel: this.channel,
        success: true,
        messageId: saved.id,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[In-App] Erreur persistance: ${errorMessage}`);
      return {
        channel: this.channel,
        success: false,
        error: errorMessage,
      };
    }
  }
}
