import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QUEUE_EVENT_PATTERNS, QueueTicketCalledEvent, QueueTicketNoShowEvent } from '../../../queue/domain/events/queue-ticket.events.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingDepositConfirmedEvent,
  BookingCancelledEvent,
  BookingDelayUpdatedEvent,
} from '../../../booking/domain/events/booking.events.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(private readonly sendNotificationUseCase: SendNotificationUseCase) {}

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CALLED, { async: true })
  public async handleTicketCalled(event: QueueTicketCalledEvent): Promise<void> {
    if (!event.customerId) return;

    this.logger.log(
      `[NotificationEventListener] Déclenchement alerte appel ticket #${event.ticketNumber} pour client: ${event.customerId}`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: `C'est votre tour ! (Ticket #${event.ticketNumber})`,
        body: `Votre ticket #${event.ticketNumber} vient d'être appelé. Vous disposez de ${event.graceMinutes} minutes pour vous présenter au fauteuil.`,
        data: {
          type: 'TICKET_CALLED',
          ticketId: event.ticketId,
          ticketNumber: event.ticketNumber,
          callDeadlineAt: event.callDeadlineAt.toISOString(),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification TICKET_CALLED: ${msg}`);
    }
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW, { async: true })
  public async handleTicketNoShow(event: QueueTicketNoShowEvent & { customerId?: string }): Promise<void> {
    if (!event.customerId) return;

    this.logger.log(
      `[NotificationEventListener] Notification No-Show pour ticket #${event.ticketNumber} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: `Délai expiré (Ticket #${event.ticketNumber})`,
        body: `Le délai de présentation pour votre ticket #${event.ticketNumber} a expiré. Votre passage a été annulé.`,
        data: {
          type: 'TICKET_NO_SHOW',
          ticketId: event.ticketId,
          ticketNumber: event.ticketNumber,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification TICKET_NO_SHOW: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DEPOSIT_CONFIRMED, { async: true })
  public async handleBookingDepositConfirmed(event: BookingDepositConfirmedEvent): Promise<void> {
    this.logger.log(
      `[NotificationEventListener] Confirmation paiement acompte pour réservation ${event.bookingId} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Réservation confirmée !',
        body: `Votre acompte de ${event.depositAmount} FCFA a été validé avec succès. Votre créneau est garanti.`,
        data: {
          type: 'BOOKING_DEPOSIT_CONFIRMED',
          bookingId: event.bookingId,
          depositAmount: event.depositAmount,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_DEPOSIT_CONFIRMED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CANCELLED, { async: true })
  public async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Réservation annulée',
        body: event.reason
          ? `Votre réservation a été annulée pour le motif suivant: ${event.reason}`
          : 'Votre réservation a été annulée.',
        data: {
          type: 'BOOKING_CANCELLED',
          bookingId: event.bookingId,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_CANCELLED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DELAY_UPDATED, { async: true })
  public async handleBookingDelayUpdated(event: BookingDelayUpdatedEvent): Promise<void> {
    if (!event.isAlertSent) return;

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Mise à jour de l\'horaire',
        body: `Un retard estimé de ${event.delayMinutes} minutes est à prévoir sur votre rendez-vous. Merci de votre compréhension.`,
        data: {
          type: 'BOOKING_DELAY_ALERT',
          bookingId: event.bookingId,
          delayMinutes: event.delayMinutes,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_DELAY_UPDATED: ${msg}`);
    }
  }
}
