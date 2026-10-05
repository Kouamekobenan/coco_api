import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingCreatedEvent,
  BookingDepositConfirmedEvent,
  BookingCancelledEvent,
} from '../../domain/events/booking.events.js';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository.interface.js';

@Injectable()
export class BookingLifecycleEventListener {
  private readonly logger = new Logger(BookingLifecycleEventListener.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.QUEUE_LIFECYCLE)
    private readonly queueLifecycleQueue: Queue,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
  ) {}

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CREATED, { async: true })
  public async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    // Cas 1 : Acompte requis -> armement timer 15 min de hold
    if (event.requiresDeposit && event.holdExpiresAt) {
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

    // Cas 2 : Réservation confirmée d'emblée (sans acompte) -> armement timer de rappel 2h
    if (!event.requiresDeposit && event.scheduledStart) {
      await this.armReminderTimer(event.bookingId, event.salonId, event.scheduledStart);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DEPOSIT_CONFIRMED, { async: true })
  public async handleDepositConfirmed(event: BookingDepositConfirmedEvent): Promise<void> {
    // 1. Annulation du timer de Hold
    const holdJobId = `hold-booking-${event.bookingId}`;
    try {
      const job = await this.queueLifecycleQueue.getJob(holdJobId);
      if (job) {
        await job.remove();
        this.logger.log(`Acompte validé pour la réservation ${event.bookingId}. Timer Hold annulé avec succès.`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Erreur lors de l'annulation du timer Hold pour la réservation ${event.bookingId}: ${error.message}`);
    }

    // 2. Armement du rappel 2h avant le RDV
    try {
      const booking = await this.bookingRepo.findById(event.bookingId);
      if (booking?.scheduledStart) {
        await this.armReminderTimer(booking.id, booking.salonId, booking.scheduledStart);
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Impossible de planifier le rappel 2h pour ${event.bookingId}: ${error.message}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CANCELLED, { async: true })
  public async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    const reminderJobId = `reminder-booking-${event.bookingId}`;
    const holdJobId = `hold-booking-${event.bookingId}`;

    try {
      const [reminderJob, holdJob] = await Promise.all([
        this.queueLifecycleQueue.getJob(reminderJobId),
        this.queueLifecycleQueue.getJob(holdJobId),
      ]);
      if (reminderJob) {
        await reminderJob.remove();
        this.logger.log(`Réservation ${event.bookingId} annulée. Timer de rappel 2h annulé.`);
      }
      if (holdJob) {
        await holdJob.remove();
      }
    } catch {
      // Ignorer si les jobs n'existaient pas
    }
  }

  private async armReminderTimer(bookingId: string, salonId: string, scheduledStart: Date): Promise<void> {
    const now = Date.now();
    const startTime = new Date(scheduledStart).getTime();
    const twoHoursBefore = startTime - 2 * 60 * 60 * 1000;
    const delayMs = twoHoursBefore - now;

    // Si le RDV a été pris pour dans moins de 2h, on ne planifie pas de rappel 2h
    if (delayMs <= 0) {
      this.logger.debug(
        `RDV ${bookingId} prévu dans moins de 2h (${new Date(scheduledStart).toISOString()}). Pas de rappel 2h différé.`,
      );
      return;
    }

    const jobId = `reminder-booking-${bookingId}`;
    this.logger.log(
      `Armement du rappel de RDV 2h pour ${bookingId} (déclenchement dans ${Math.round(delayMs / 1000 / 60)} min) - JobID: ${jobId}`,
    );

    try {
      await this.queueLifecycleQueue.add(
        QUEUE_JOBS.REMIND_UPCOMING_BOOKING,
        { bookingId, salonId },
        {
          jobId,
          delay: delayMs,
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
        },
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Impossible d'armer le timer de rappel pour la réservation ${bookingId}: ${error.message}`);
    }
  }
}
