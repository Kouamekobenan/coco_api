import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Queue } from 'bullmq';
import { QueueLifecycleEventListener } from './queue-lifecycle-event.listener.js';
import {
  QueueTicketCalledEvent,
} from '../../domain/events/queue-ticket.events.js';
import { QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';

describe('QueueLifecycleEventListener', () => {
  let listener: QueueLifecycleEventListener;
  let mockQueue: Queue;

  beforeEach(() => {
    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    } as unknown as Queue;

    listener = new QueueLifecycleEventListener(mockQueue);
  });

  it('devrait armer un job différé No-Show avec jobId idempotent et délai calculé', async () => {
    const event = new QueueTicketCalledEvent(
      'ticket-456',
      'salon-99',
      'W-042',
      new Date(),
      10,
      'cust-1',
    );

    await listener.handleTicketCalled(event);

    expect(mockQueue.add).toHaveBeenCalledTimes(1);
    expect(mockQueue.add).toHaveBeenCalledWith(
      QUEUE_JOBS.CHECK_NO_SHOW,
      {
        ticketId: 'ticket-456',
        salonId: 'salon-99',
      },
      expect.objectContaining({
        jobId: 'no-show-ticket-456',
        delay: 600000, // 10 minutes en ms
        attempts: 3,
      }),
    );
  });
});
