import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueTicketStatus } from '@prisma/client';
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

interface CheckNoShowJobPayload {
  ticketId: string;
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

  public async process(job: Job<CheckNoShowJobPayload>): Promise<void> {
    if (job.name === QUEUE_JOBS.CHECK_NO_SHOW) {
      await this.processNoShowCheck(job.data);
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
}
