import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Queue } from 'bullmq';
import { BookingLifecycleEventListener } from './booking-lifecycle-event.listener.js';
import {
  BookingCreatedEvent,
  BookingDepositConfirmedEvent,
  BookingCancelledEvent,
} from '../../domain/events/booking.events.js';
import { QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';

describe('BookingLifecycleEventListener', () => {
  let listener: BookingLifecycleEventListener;
  let mockQueue: Queue;
  let mockBookingRepo: Partial<IBookingRepository>;

  beforeEach(() => {
    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
      getJob: vi.fn(),
    } as unknown as Queue;

    mockBookingRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'booking-123',
        salonId: 'salon-456',
        scheduledStart: new Date(Date.now() + 5 * 60 * 60 * 1000), // Dans 5 heures
      }),
    };

    listener = new BookingLifecycleEventListener(
      mockQueue,
      mockBookingRepo as IBookingRepository,
    );
  });

  describe('handleBookingCreated', () => {
    it('devrait armer le timer Hold si un acompte est requis avec holdExpiresAt', async () => {
      const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const event = new BookingCreatedEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        true,
        holdExpiresAt,
        new Date(Date.now() + 5 * 60 * 60 * 1000),
      );

      await listener.handleBookingCreated(event);

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

    it('devrait armer le rappel 2h si aucun acompte n\'est requis et le RDV est dans plus de 2h', async () => {
      const scheduledStart = new Date(Date.now() + 4 * 60 * 60 * 1000); // Dans 4h
      const event = new BookingCreatedEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        false,
        null,
        scheduledStart,
      );

      await listener.handleBookingCreated(event);

      expect(mockQueue.add).toHaveBeenCalledWith(
        QUEUE_JOBS.REMIND_UPCOMING_BOOKING,
        {
          bookingId: 'booking-123',
          salonId: 'salon-456',
        },
        expect.objectContaining({
          jobId: 'reminder-booking-booking-123',
          delay: expect.any(Number),
        }),
      );
    });
  });

  describe('handleDepositConfirmed', () => {
    it('devrait supprimer le job Hold et armer le rappel 2h', async () => {
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
      expect(mockQueue.add).toHaveBeenCalledWith(
        QUEUE_JOBS.REMIND_UPCOMING_BOOKING,
        {
          bookingId: 'booking-123',
          salonId: 'salon-456',
        },
        expect.objectContaining({
          jobId: 'reminder-booking-booking-123',
        }),
      );
    });
  });

  describe('handleBookingCancelled', () => {
    it('devrait supprimer les jobs de rappel et de hold si la réservation est annulée', async () => {
      const mockJob = { remove: vi.fn().mockResolvedValue(true) };
      vi.mocked(mockQueue.getJob).mockResolvedValue(mockJob as any);

      const event = new BookingCancelledEvent(
        'booking-123',
        'salon-456',
        'customer-789',
        'Client empêché',
      );

      await listener.handleBookingCancelled(event);

      expect(mockQueue.getJob).toHaveBeenCalledWith('reminder-booking-booking-123');
      expect(mockQueue.getJob).toHaveBeenCalledWith('hold-booking-booking-123');
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });
});
