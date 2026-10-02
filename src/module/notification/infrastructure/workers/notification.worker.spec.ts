import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationChannel } from '@prisma/client';
import { Job } from 'bullmq';
import { NotificationWorker, SendNotificationJobData } from './notification.worker.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';
import { QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';

describe('NotificationWorker', () => {
  let worker: NotificationWorker;
  let mockSendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    mockSendNotificationUseCase = {
      executeDirect: vi.fn().mockResolvedValue({
        channel: NotificationChannel.SMS,
        success: true,
        messageId: 'sms-msg-123',
      }),
    } as unknown as SendNotificationUseCase;

    worker = new NotificationWorker(mockSendNotificationUseCase);
  });

  it('doit traiter un job send-notification avec succès', async () => {
    const job = {
      id: 'job-1',
      name: QUEUE_JOBS.SEND_NOTIFICATION,
      attemptsMade: 0,
      data: {
        channel: NotificationChannel.SMS,
        payload: {
          userId: 'user-1',
          title: 'Ticket #012',
          body: 'Votre tour arrive',
          recipientPhone: '+2250700000000',
        },
      },
    } as Job<SendNotificationJobData>;

    await expect(worker.process(job)).resolves.toBeUndefined();

    expect(mockSendNotificationUseCase.executeDirect).toHaveBeenCalledWith(
      NotificationChannel.SMS,
      job.data.payload,
    );
  });

  it('doit lancer une exception si l\'envoi échoue pour déclencher le retry BullMQ', async () => {
    mockSendNotificationUseCase.executeDirect = vi.fn().mockResolvedValue({
      channel: NotificationChannel.SMS,
      success: false,
      error: 'Passerelle opérateur momentanément indisponible',
    });

    const job = {
      id: 'job-2',
      name: QUEUE_JOBS.SEND_NOTIFICATION,
      attemptsMade: 1,
      data: {
        channel: NotificationChannel.SMS,
        payload: {
          userId: 'user-2',
          title: 'Alerte',
          body: 'Test',
        },
      },
    } as Job<SendNotificationJobData>;

    await expect(worker.process(job)).rejects.toThrow('Échec d\'envoi notification');
  });
});
