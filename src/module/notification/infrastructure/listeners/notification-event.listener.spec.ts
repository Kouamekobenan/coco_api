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
        title: 'Réservation confirmée !',
        body: expect.stringContaining('5000 FCFA'),
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
