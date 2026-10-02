import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationChannel } from '@prisma/client';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';
import { NotificationPayload } from '../../domain/strategies/notification-channel.strategy.interface.js';

export interface SendNotificationJobData {
  channel: NotificationChannel;
  payload: NotificationPayload;
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly sendNotificationUseCase: SendNotificationUseCase) {
    super();
  }

  public async process(job: Job<SendNotificationJobData>): Promise<void> {
    const { name, data, id, attemptsMade } = job;

    if (name === QUEUE_JOBS.SEND_NOTIFICATION) {
      this.logger.log(
        `[NotificationWorker] Traitement job ${id} (Canal: ${data.channel}, Tentative: ${attemptsMade + 1}) pour user: ${data.payload.userId}`,
      );

      const result = await this.sendNotificationUseCase.executeDirect(
        data.channel,
        data.payload,
      );

      if (!result.success) {
        this.logger.warn(
          `[NotificationWorker] Échec envoi job ${id} sur ${data.channel}: ${result.error}`,
        );
        throw new Error(
          `Échec d'envoi notification (${data.channel}): ${result.error || 'Erreur indéterminée'}`,
        );
      }

      this.logger.log(
        `[NotificationWorker] Job ${id} terminé avec succès (MessageID: ${result.messageId})`,
      );
    }
  }
}
