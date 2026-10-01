import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketCalledEvent,
} from '../../domain/events/queue-ticket.events.js';

@Injectable()
export class QueueLifecycleEventListener {
  private readonly logger = new Logger(QueueLifecycleEventListener.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.QUEUE_LIFECYCLE)
    private readonly queueLifecycleQueue: Queue,
  ) {}

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CALLED, { async: true })
  public async handleTicketCalled(event: QueueTicketCalledEvent): Promise<void> {
    const delayMs = Math.max(1, event.graceMinutes) * 60 * 1000;
    const jobId = `no-show-${event.ticketId}`;

    this.logger.log(
      `Ticket appelé: #${event.ticketNumber} (Salon: ${event.salonId}). Armement du timer No-Show BullMQ (${event.graceMinutes} min) - JobID: ${jobId}`,
    );

    try {
      await this.queueLifecycleQueue.add(
        QUEUE_JOBS.CHECK_NO_SHOW,
        {
          ticketId: event.ticketId,
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
        `Impossible d'armer le job No-Show pour le ticket ${event.ticketId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
