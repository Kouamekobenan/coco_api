import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface.js';
import { CustomerNoteEntity } from '../../domain/entities/customer-note.entity.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingCompletedEvent,
  BookingNoShowEvent,
} from '../../../booking/domain/events/booking.events.js';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketCompletedEvent,
  QueueTicketNoShowEvent,
} from '../../../queue/domain/events/queue-ticket.events.js';

@Injectable()
export class CustomerSyncEventListener {
  private readonly logger = new Logger(CustomerSyncEventListener.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_COMPLETED, { async: true })
  public async handleBookingCompleted(event: BookingCompletedEvent): Promise<void> {
    try {
      const customer = await this.customerRepo.findById(event.customerId);
      if (!customer) {
        return;
      }

      customer.recordVisit(event.totalPrice, event.completedAt);
      await this.customerRepo.update(customer);

      this.logger.log(
        `[CRM Synchro] Visite enregistrée pour le client ${customer.getName()} (${customer.getId()}) suite à la réservation ${event.bookingId}. Nouveau segment: ${customer.getSegment()}, Total: ${customer.getTotalSpent()} FCFA`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`[CRM Synchro] Erreur mise à jour visite client: ${error.message}`, error.stack);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_NO_SHOW, { async: true })
  public async handleBookingNoShow(event: BookingNoShowEvent): Promise<void> {
    try {
      const customer = await this.customerRepo.findById(event.customerId);
      if (!customer) {
        return;
      }

      const note = CustomerNoteEntity.create({
        id: randomUUID(),
        salonId: event.salonId,
        salonCustomerId: customer.getId(),
        authorId: 'SYSTEM',
        content: `⚠️ Incident No-Show : Le client ne s'est pas présenté au rendez-vous (${event.bookingId}) le ${new Date().toLocaleDateString('fr-FR')}.`,
        isPrivate: true,
      });

      await this.customerRepo.saveNote(note);

      this.logger.warn(
        `[CRM Synchro] Incident No-Show enregistré sur la fiche du client ${customer.getName()} (${customer.getId()}) pour la réservation ${event.bookingId}`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`[CRM Synchro] Erreur enregistrement incident No-Show: ${error.message}`, error.stack);
    }
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW, { async: true })
  public async handleTicketNoShow(event: QueueTicketNoShowEvent): Promise<void> {
    this.logger.debug(
      `[CRM Synchro] Traitement No-Show pour le ticket #${event.ticketNumber} (${event.ticketId})`,
    );
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_COMPLETED, { async: true })
  public async handleTicketCompleted(event: QueueTicketCompletedEvent): Promise<void> {
    this.logger.debug(
      `[CRM Synchro] Ticket terminé #${event.ticketNumber} (${event.ticketId})`,
    );
  }
}
