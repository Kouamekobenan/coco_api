import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  type INotificationPreferenceRepository,
} from '../../domain/repositories/notification-preference.repository.interface.js';
import {
  NOTIFICATION_STRATEGIES,
  type INotificationChannelStrategy,
  type NotificationPayload,
  type NotificationSendResult,
} from '../../domain/strategies/notification-channel.strategy.interface.js';
import { SendNotificationDto } from '../dtos/send-notification.dto.js';

@Injectable()
export class SendNotificationUseCase {
  private readonly logger = new Logger(SendNotificationUseCase.name);
  private readonly strategyMap = new Map<NotificationChannel, INotificationChannelStrategy>();

  constructor(
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferenceRepo: INotificationPreferenceRepository,
    @Inject(NOTIFICATION_STRATEGIES)
    private readonly strategies: INotificationChannelStrategy[],
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
  ) {
    for (const strategy of this.strategies) {
      this.strategyMap.set(strategy.channel, strategy);
    }
  }

  /**
   * Orchestre l'envoi d'une notification multi-canaux.
   * Si asyncQueue = true (par défaut pour push/sms/whatsapp), pousse dans la file BullMQ.
   * Pour IN_APP, exécute toujours en direct pour un affichage temps réel immédiat.
   */
  public async execute(
    dto: SendNotificationDto,
    options: { asyncQueue?: boolean } = { asyncQueue: true },
  ): Promise<NotificationSendResult[]> {
    const { userId, salonId, title, body, data } = dto;

    // 1. Récupération des préférences utilisateur
    const preferences = await this.preferenceRepo.findByUserId(userId);

    // 2. Récupération du profil utilisateur (téléphone, push tokens)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: {
          where: { pushToken: { not: null } },
          select: { pushToken: true },
        },
      },
    });

    const recipientPhone = dto.recipientPhone || user?.phone;
    const pushTokens = user?.devices
      .map((d) => d.pushToken)
      .filter((token): token is string => Boolean(token)) || [];

    // 3. Détermination des canaux autorisés
    const requestedChannels = dto.channels && dto.channels.length > 0
      ? dto.channels
      : [
          NotificationChannel.IN_APP,
          NotificationChannel.PUSH,
          NotificationChannel.WHATSAPP,
          NotificationChannel.SMS,
        ];

    const activeChannels = requestedChannels.filter((channel) => {
      if (!preferences) return true; // Si pas de prefs explicites, par défaut tout est actif
      switch (channel) {
        case NotificationChannel.IN_APP:
          return preferences.inAppEnabled;
        case NotificationChannel.PUSH:
          return preferences.pushEnabled && pushTokens.length > 0;
        case NotificationChannel.WHATSAPP:
          return preferences.whatsappEnabled && Boolean(recipientPhone);
        case NotificationChannel.SMS:
          return preferences.smsEnabled && Boolean(recipientPhone);
        default:
          return false;
      }
    });

    const payload: NotificationPayload = {
      userId,
      salonId,
      title,
      body,
      data,
      recipientPhone,
      pushTokens,
    };

    const results: NotificationSendResult[] = [];

    for (const channel of activeChannels) {
      // In-App est TOUJOURS exécuté immédiatement (persistance DB + WebSocket)
      if (channel === NotificationChannel.IN_APP || !options.asyncQueue) {
        const strategy = this.strategyMap.get(channel);
        if (strategy) {
          try {
            const res = await strategy.send(payload);
            results.push(res);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(`Erreur envoi stratégie ${channel}: ${errorMessage}`);
            results.push({ channel, success: false, error: errorMessage });
          }
        }
      } else {
        // Canaux tiers asynchrones (SMS, WhatsApp, FCM) confiés à BullMQ avec retry exponentiel
        try {
          const jobId = `notif-${channel.toLowerCase()}-${userId}-${Date.now()}`;
          await this.notificationQueue.add(
            QUEUE_JOBS.SEND_NOTIFICATION,
            {
              channel,
              payload,
            },
            {
              jobId,
            },
          );
          results.push({
            channel,
            success: true,
            messageId: jobId,
          });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          this.logger.warn(`Impossible de planifier le job BullMQ pour ${channel}: ${errorMessage}`);
          // Repli direct si Redis indisponible
          const strategy = this.strategyMap.get(channel);
          if (strategy) {
            const res = await strategy.send(payload);
            results.push(res);
          }
        }
      }
    }

    return results;
  }

  /**
   * Exécution directe par le worker BullMQ pour un canal spécifique
   */
  public async executeDirect(
    channel: NotificationChannel,
    payload: NotificationPayload,
  ): Promise<NotificationSendResult> {
    const strategy = this.strategyMap.get(channel);
    if (!strategy) {
      throw new Error(`Aucune stratégie trouvée pour le canal: ${channel}`);
    }
    return strategy.send(payload);
  }
}
