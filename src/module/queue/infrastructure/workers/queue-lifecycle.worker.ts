import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueTicketStatus, BookingStatus } from '@prisma/client';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import {
  QUEUE_REPOSITORY,
  type IQueueRepository,
} from '../../domain/repositories/queue.repository.interface.js';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../../booking/domain/repositories/booking.repository.interface.js';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketNoShowEvent,
} from '../../domain/events/queue-ticket.events.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingHoldExpiredEvent,
  BookingReminderEvent,
} from '../../../booking/domain/events/booking.events.js';

interface CheckNoShowJobPayload {
  ticketId: string;
  salonId: string;
}

interface ReleaseUnpaidBookingJobPayload {
  bookingId: string;
  salonId: string;
}

interface RemindUpcomingBookingJobPayload {
  bookingId: string;
  salonId: string;
}

@Processor(QUEUE_NAMES.QUEUE_LIFECYCLE)
export class QueueLifecycleWorker extends WorkerHost {
  private readonly logger = new Logger(QueueLifecycleWorker.name);

  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  public async process(
    job: Job<CheckNoShowJobPayload | ReleaseUnpaidBookingJobPayload | RemindUpcomingBookingJobPayload>,
  ): Promise<void> {
    if (job.name === QUEUE_JOBS.CHECK_NO_SHOW) {
      await this.processNoShowCheck(job.data as CheckNoShowJobPayload);
    } else if (job.name === QUEUE_JOBS.RELEASE_UNPAID_BOOKING) {
      await this.processReleaseUnpaidBooking(job.data as ReleaseUnpaidBookingJobPayload);
    } else if (job.name === QUEUE_JOBS.REMIND_UPCOMING_BOOKING) {
      await this.processRemindUpcomingBooking(job.data as RemindUpcomingBookingJobPayload);
    }
  }

  private async processNoShowCheck(payload: CheckNoShowJobPayload): Promise<void> {
    const { ticketId, salonId } = payload;
    const ticket = await this.queueRepo.findById(ticketId);

    if (!ticket) {
      this.logger.warn(`Vérification No-Show: Ticket ${ticketId} introuvable.`);
      return;
    }

    if (ticket.salonId !== salonId) {
      this.logger.warn(`Vérification No-Show: Incohérence salonId pour le ticket ${ticketId}.`);
      return;
    }

    // Le client ne s'est pas présenté avant l'échéance des 10 minutes
    if (ticket.status === QueueTicketStatus.CALLED) {
      this.logger.log(
        `Délai de grâce expiré pour le ticket #${ticket.ticketNumber} (${ticket.id}). Résolution automatique en NO_SHOW.`,
      );

      ticket.markNoShow();
      await this.queueRepo.update(ticket);

      // Synchronisation de la réservation liée si applicable
      if (ticket.bookingId) {
        const booking = await this.bookingRepo.findById(ticket.bookingId);
        if (booking) {
          booking.markNoShow();
          await this.bookingRepo.update(booking);
        }
      }

      this.eventEmitter.emit(
        QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW,
        new QueueTicketNoShowEvent(ticket.id, ticket.salonId, ticket.ticketNumber.value, new Date()),
      );
    } else {
      this.logger.debug(
        `Ticket #${ticket.ticketNumber.value} n'est plus en attente d'appel (Statut actuel: ${ticket.status}). Aucune action No-Show requise.`,
      );
    }
  }

  private async processReleaseUnpaidBooking(payload: ReleaseUnpaidBookingJobPayload): Promise<void> {
    const { bookingId, salonId } = payload;
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) {
      this.logger.warn(`Vérification Hold 15 min: Réservation ${bookingId} introuvable.`);
      return;
    }

    if (booking.salonId !== salonId) {
      this.logger.warn(`Vérification Hold: Incohérence salonId pour la réservation ${bookingId}.`);
      return;
    }

    // Si la réservation est toujours en attente d'acompte (non payé dans les 15 minutes)
    if (booking.status === BookingStatus.PENDING_DEPOSIT) {
      this.logger.log(
        `Délai de Hold (15 min) expiré pour la réservation ${booking.id}. Créneau libéré et passage en EXPIRED.`,
      );

      booking.expireHold();
      await this.bookingRepo.update(booking);

      this.eventEmitter.emit(
        BOOKING_EVENT_PATTERNS.BOOKING_EXPIRED,
        new BookingHoldExpiredEvent(booking.id, booking.salonId, booking.customerId, new Date()),
      );
    } else {
      this.logger.debug(
        `Réservation ${booking.id} n'est plus en attente d'acompte (Statut actuel: ${booking.status}). Aucune expiration requise.`,
      );
    }
  }

  private async processRemindUpcomingBooking(payload: RemindUpcomingBookingJobPayload): Promise<void> {
    const { bookingId, salonId } = payload;
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) {
      this.logger.warn(`Rappel 2h: Réservation ${bookingId} introuvable.`);
      return;
    }

    if (booking.salonId !== salonId) {
      this.logger.warn(`Rappel 2h: Incohérence salonId pour la réservation ${bookingId}.`);
      return;
    }

    // Le rappel est envoyé uniquement si le RDV est confirmé ou checké (et non annulé/terminé)
    if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.CHECKED_IN) {
      this.logger.log(
        `[QueueLifecycleWorker] Émission du rappel de RDV 2h pour la réservation ${bookingId} (client: ${booking.customerId})`,
      );

      this.eventEmitter.emit(
        BOOKING_EVENT_PATTERNS.BOOKING_REMINDER,
        new BookingReminderEvent(
          booking.id,
          booking.salonId,
          booking.customerId,
          booking.scheduledStart,
        ),
      );
    } else {
      this.logger.debug(
        `Rappel 2h ignoré pour la réservation ${bookingId} (Statut actuel: ${booking.status})`,
      );
    }
  }
}

