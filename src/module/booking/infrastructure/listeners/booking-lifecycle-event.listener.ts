import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingCreatedEvent,
  BookingDepositConfirmedEvent,
} from '../../domain/events/booking.events.js';

@Injectable()
export class BookingLifecycleEventListener {
  private readonly logger = new Logger(BookingLifecycleEventListener.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.QUEUE_LIFECYCLE)
    private readonly queueLifecycleQueue: Queue,
  ) {}

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CREATED, { async: true })
  public async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    if (!event.requiresDeposit || !event.holdExpiresAt) {
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(event.holdExpiresAt).getTime();
    const delayMs = Math.max(1000, expiresAt - now);
    const jobId = `hold-booking-${event.bookingId}`;

    this.logger.log(
      `Réservation avec acompte créée (${event.bookingId}, Salon: ${event.salonId}). Armement du timer Hold 15 min BullMQ (${Math.round(delayMs / 1000 / 60)} min) - JobID: ${jobId}`,
    );

    try {
      await this.queueLifecycleQueue.add(
        QUEUE_JOBS.RELEASE_UNPAID_BOOKING,
        {
          bookingId: event.bookingId,
          salonId: event.salonId,
        },
        {
          jobId,
          delay: delayMs,
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Impossible d'armer le timer Hold pour la réservation ${event.bookingId}: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DEPOSIT_CONFIRMED, { async: true })
  public async handleDepositConfirmed(event: BookingDepositConfirmedEvent): Promise<void> {
    const jobId = `hold-booking-${event.bookingId}`;

    try {
      const job = await this.queueLifecycleQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Acompte validé pour la réservation ${event.bookingId}. Timer Hold annulé avec succès.`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Erreur lors de l'annulation du timer Hold pour la réservation ${event.bookingId}: ${error.message}`);
    }
  }
}
