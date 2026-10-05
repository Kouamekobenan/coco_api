import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationChannel } from '@prisma/client';
import { SendNotificationUseCase } from './send-notification.usecase.js';
import { INotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository.interface.js';
import { INotificationChannelStrategy } from '../../domain/strategies/notification-channel.strategy.interface.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { Queue } from 'bullmq';

describe('SendNotificationUseCase', () => {
  let useCase: SendNotificationUseCase;
  let mockPreferenceRepo: INotificationPreferenceRepository;
  let mockInAppStrategy: INotificationChannelStrategy;
  let mockPushStrategy: INotificationChannelStrategy;
  let mockWhatsAppStrategy: INotificationChannelStrategy;
  let mockSmsStrategy: INotificationChannelStrategy;
  let mockPrisma: any;
  let mockQueue: Queue;

  beforeEach(() => {
    mockPreferenceRepo = {
      findByUserId: vi.fn().mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        inAppEnabled: true,
        pushEnabled: true,
        whatsappEnabled: true,
        smsEnabled: true,
        updatedAt: new Date(),
      }),
      upsert: vi.fn(),
    };

    mockInAppStrategy = {
      channel: NotificationChannel.IN_APP,
      send: vi.fn().mockResolvedValue({ channel: NotificationChannel.IN_APP, success: true, messageId: 'inapp-1' }),
    };

    mockPushStrategy = {
      channel: NotificationChannel.PUSH,
      send: vi.fn().mockResolvedValue({ channel: NotificationChannel.PUSH, success: true, messageId: 'push-1' }),
    };

    mockWhatsAppStrategy = {
      channel: NotificationChannel.WHATSAPP,
      send: vi.fn().mockResolvedValue({ channel: NotificationChannel.WHATSAPP, success: true, messageId: 'wa-1' }),
    };

    mockSmsStrategy = {
      channel: NotificationChannel.SMS,
      send: vi.fn().mockResolvedValue({ channel: NotificationChannel.SMS, success: true, messageId: 'sms-1' }),
    };

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          phone: '+2250701020304',
          devices: [{ pushToken: 'token-abc' }],
        }),
      },
    };

    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    } as unknown as Queue;

    useCase = new SendNotificationUseCase(
      mockPreferenceRepo,
      [mockInAppStrategy, mockPushStrategy, mockWhatsAppStrategy, mockSmsStrategy],
      mockPrisma as PrismaService,
      mockQueue,
    );
  });

  it('doit envoyer immédiatement la notification In-App et mettre en file BullMQ les autres canaux', async () => {
    const results = await useCase.execute({
      userId: 'user-1',
      title: 'Votre ticket est appelé',
      body: 'Présentez-vous au salon',
    });

    // In-App est exécuté en direct
    expect(mockInAppStrategy.send).toHaveBeenCalledTimes(1);

    // Push, WhatsApp, SMS sont confiés à la queue BullMQ
    expect(mockQueue.add).toHaveBeenCalledTimes(3);

    expect(results).toHaveLength(4);
    expect(results.find((r) => r.channel === NotificationChannel.IN_APP)?.success).toBe(true);
  });

  it('doit respecter les préférences utilisateur désactivées', async () => {
    // L'utilisateur a désactivé le SMS et WhatsApp
    mockPreferenceRepo.findByUserId = vi.fn().mockResolvedValue({
      id: 'pref-1',
      userId: 'user-1',
      inAppEnabled: true,
      pushEnabled: false,
      whatsappEnabled: false,
      smsEnabled: false,
      updatedAt: new Date(),
    });

    const results = await useCase.execute({
      userId: 'user-1',
      title: 'Ticket validé',
      body: 'En attente',
    });

    expect(mockInAppStrategy.send).toHaveBeenCalledTimes(1);
    expect(mockQueue.add).not.toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0].channel).toBe(NotificationChannel.IN_APP);
  });

  it('doit exécuter directement via executeDirect lorsqu\'invoqué par le worker', async () => {
    const result = await useCase.executeDirect(NotificationChannel.WHATSAPP, {
      userId: 'user-1',
      title: 'Rappel RDV',
      body: 'Votre rdv est dans 1h',
      recipientPhone: '+2250701020304',
    });

    expect(mockWhatsAppStrategy.send).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.channel).toBe(NotificationChannel.WHATSAPP);
  });
});
