import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationEventListener } from './notification-event.listener.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';
import { QueueTicketCalledEvent } from '../../../queue/domain/events/queue-ticket.events.js';
import { BookingDepositConfirmedEvent } from '../../../booking/domain/events/booking.events.js';
import { UserRegisteredEvent } from '../../../auth/domain/events/auth.events.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { NotificationChannel } from '@prisma/client';

describe('NotificationEventListener', () => {
  let listener: NotificationEventListener;
  let mockSendNotificationUseCase: SendNotificationUseCase;
  let mockPrisma: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockSendNotificationUseCase = {
      execute: vi.fn().mockResolvedValue([]),
    } as unknown as SendNotificationUseCase;

    mockPrisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'admin-1', firstName: 'SuperAdmin', phone: '+2250700000001' },
          { id: 'admin-2', firstName: 'Admin2', phone: '+2250700000002' },
        ]),
      },
    };

    listener = new NotificationEventListener(
      mockSendNotificationUseCase,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('doit envoyer une notification lorsque le ticket est appelé', async () => {
    const event = new QueueTicketCalledEvent(
      'ticket-1',
      'salon-1',
      'W-015',
      new Date(Date.now() + 10 * 60000),
      10,
      'client-1',
    );

    await listener.handleTicketCalled(event);

    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'client-1',
        salonId: 'salon-1',
        title: expect.stringContaining('#W-015'),
      }),
    );
  });

  it('doit envoyer une notification de confirmation lorsque l\'acompte est validé', async () => {
    const event = new BookingDepositConfirmedEvent(
      'booking-99',
      'salon-1',
      'client-2',
      5000,
    );

    await listener.handleBookingDepositConfirmed(event);

    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'client-2',
        salonId: 'salon-1',
        title: expect.stringContaining('Réservation confirmée'),
        body: expect.stringContaining('5000 FCFA'),
      }),
    );
  });

  it('doit envoyer une notification lors de la création d\'un ticket', async () => {
    const event = {
      ticketId: 'ticket-10',
      salonId: 'salon-1',
      ticketNumber: 'W-020',
      queueType: 'WALK_IN',
      customerId: 'client-3',
    };

    await listener.handleTicketCreated(event);

    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'client-3',
        salonId: 'salon-1',
        title: expect.stringContaining('Ticket #W-020'),
      }),
    );
  });

  it('doit envoyer une notification d\'avis lorsque la réservation est terminée', async () => {
    const event = {
      bookingId: 'booking-100',
      salonId: 'salon-1',
      customerId: 'client-4',
      totalPrice: 15000,
      completedAt: new Date(),
    };

    await listener.handleBookingCompleted(event);

    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'client-4',
        salonId: 'salon-1',
        title: expect.stringContaining('Merci pour votre visite'),
      }),
    );
  });

  it('ne doit rien envoyer si aucun customerId n\'est associé au ticket', async () => {
    const event = new QueueTicketCalledEvent(
      'ticket-anonymous',
      'salon-1',
      'W-099',
      new Date(),
      10,
      null, // Client anonyme sans compte
    );

    await listener.handleTicketCalled(event);

    expect(mockSendNotificationUseCase.execute).not.toHaveBeenCalled();
  });

  it('doit envoyer une notification Push et In-App à tous les administrateurs lors de la création d un compte client', async () => {
    const event = new UserRegisteredEvent(
      'user-new-client',
      '+2250701020304',
      '07 01 02 03 04',
      'client@coco.ci',
      'Awa',
      'Kouassi',
      'Awa Kouassi',
      'COCOMOUSSO',
      new Date(),
    );

    await listener.handleUserRegistered(event);

    // Vérifie que les 2 admins ont reçu une notification
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);

    expect(mockSendNotificationUseCase.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        userId: 'admin-1',
        title: 'Nouveau compte client créé 👤',
        body: expect.stringContaining('Awa Kouassi'),
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        data: expect.objectContaining({
          type: 'USER_REGISTERED',
          clientId: 'user-new-client',
          clientPhone: '+2250701020304',
        }),
      }),
    );

    expect(mockSendNotificationUseCase.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        userId: 'admin-2',
        title: 'Nouveau compte client créé 👤',
        body: expect.stringContaining('Awa Kouassi'),
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      }),
    );
  });

  it('ne doit rien envoyer si aucun administrateur n est actif', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([]);

    const event = new UserRegisteredEvent(
      'user-new-client',
      '+2250701020304',
      '07 01 02 03 04',
      null,
      null,
      null,
      null,
      'COCOMOUSSO',
      new Date(),
    );

    await listener.handleUserRegistered(event);

    expect(mockSendNotificationUseCase.execute).not.toHaveBeenCalled();
  });
});

