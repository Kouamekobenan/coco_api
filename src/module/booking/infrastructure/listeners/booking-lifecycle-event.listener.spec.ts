import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Queue } from 'bullmq';
import { BookingLifecycleEventListener } from './booking-lifecycle-event.listener.js';
import {
  BookingCreatedEvent,
  BookingDepositConfirmedEvent,
} from '../../domain/events/booking.events.js';
import { QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';

describe('BookingLifecycleEventListener', () => {
  let listener: BookingLifecycleEventListener;
  let mockQueue: Queue;

  beforeEach(() => {
    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
      getJob: vi.fn(),
    } as unknown as Queue;

    listener = new BookingLifecycleEventListener(mockQueue);
  });

  describe('handleBookingCreated', () => {
    it('devrait armer le timer BullMQ si un acompte est requis avec holdExpiresAt', async () => {
      const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const event = new BookingCreatedEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        true,
        holdExpiresAt,
        new Date(),
      );

      await listener.handleBookingCreated(event);

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        QUEUE_JOBS.RELEASE_UNPAID_BOOKING,
        {
          bookingId: 'booking-123',
          salonId: 'salon-456',
        },
        expect.objectContaining({
          jobId: 'hold-booking-booking-123',
          delay: expect.any(Number),
        }),
      );
    });

    it('ne devrait PAS armer de timer si aucun acompte n\'est requis', async () => {
      const event = new BookingCreatedEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        false,
        null,
      );

      await listener.handleBookingCreated(event);

      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('handleDepositConfirmed', () => {
    it('devrait supprimer le job Hold si le paiement de l\'acompte est confirmé', async () => {
      const mockJob = { remove: vi.fn().mockResolvedValue(true) };
      vi.mocked(mockQueue.getJob).mockResolvedValue(mockJob as any);

      const event = new BookingDepositConfirmedEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        5000,
        new Date(),
      );

      await listener.handleDepositConfirmed(event);

      expect(mockQueue.getJob).toHaveBeenCalledWith('hold-booking-booking-123');
      expect(mockJob.remove).toHaveBeenCalledTimes(1);
    });
  });
});
