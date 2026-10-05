import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationEventListener } from './notification-event.listener.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';
import { QueueTicketCalledEvent } from '../../../queue/domain/events/queue-ticket.events.js';
import { BookingDepositConfirmedEvent } from '../../../booking/domain/events/booking.events.js';

describe('NotificationEventListener', () => {
  let listener: NotificationEventListener;
  let mockSendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    mockSendNotificationUseCase = {
      execute: vi.fn().mockResolvedValue([]),
    } as unknown as SendNotificationUseCase;

    listener = new NotificationEventListener(mockSendNotificationUseCase);
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
});
