import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueTicketStatus, QueueType, BookingStatus } from '@prisma/client';
import { QueueLifecycleWorker } from './queue-lifecycle.worker.js';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { TicketNumber } from '../../domain/value-objects/ticket-number.vo.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';
import { QUEUE_JOBS } from '../../../../common/queue/queue.constants.js';
import { QUEUE_EVENT_PATTERNS } from '../../domain/events/queue-ticket.events.js';

describe('QueueLifecycleWorker', () => {
  let worker: QueueLifecycleWorker;
  let mockQueueRepo: IQueueRepository;
  let mockBookingRepo: IBookingRepository;
  let mockEventEmitter: EventEmitter2;

  const createSampleTicket = (status: QueueTicketStatus = QueueTicketStatus.CALLED) => {
    return new QueueTicketEntity({
      id: 'ticket-777',
      salonId: 'salon-1',
      customerId: 'customer-1',
      bookingId: null,
      queueType: QueueType.WALK_IN,
      ticketNumber: new TicketNumber('W-077'),
      status,
      estimate: new QueueWaitEstimate(10, 20),
      qrCodeToken: 'mock-qr',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockQueueRepo = {
      findById: vi.fn(),
      update: vi.fn().mockImplementation(async (t) => t),
    } as unknown as IQueueRepository;

    mockBookingRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as IBookingRepository;

    mockEventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    worker = new QueueLifecycleWorker(mockQueueRepo, mockBookingRepo, mockEventEmitter);
  });

  it('devrait passer le ticket en NO_SHOW si le statut est toujours CALLED à échéance', async () => {
    const ticket = createSampleTicket(QueueTicketStatus.CALLED);
    vi.mocked(mockQueueRepo.findById).mockResolvedValue(ticket);

    const mockJob = {
      name: QUEUE_JOBS.CHECK_NO_SHOW,
      data: { ticketId: 'ticket-777', salonId: 'salon-1' },
    } as unknown as Job;

    await worker.process(mockJob);

    expect(mockQueueRepo.update).toHaveBeenCalledTimes(1);
    expect(ticket.status).toBe(QueueTicketStatus.NO_SHOW);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW,
      expect.objectContaining({
        ticketId: 'ticket-777',
        salonId: 'salon-1',
        ticketNumber: 'W-077',
      }),
    );
  });

  it('ne devrait RIEN faire si le client est déjà pris en charge (ex: IN_SERVICE)', async () => {
    const ticket = createSampleTicket(QueueTicketStatus.IN_SERVICE);
    vi.mocked(mockQueueRepo.findById).mockResolvedValue(ticket);

    const mockJob = {
      name: QUEUE_JOBS.CHECK_NO_SHOW,
      data: { ticketId: 'ticket-777', salonId: 'salon-1' },
    } as unknown as Job;

    await worker.process(mockJob);

    expect(mockQueueRepo.update).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  describe('release-unpaid-booking (Hold 15 min)', () => {
    it('devrait passer la réservation en EXPIRED si l\'acompte n\'a pas été payé dans les 15 min', async () => {
      const mockBooking = {
        id: 'booking-999',
        salonId: 'salon-1',
        customerId: 'customer-1',
        status: BookingStatus.PENDING_DEPOSIT,
        expireHold: vi.fn().mockImplementation(function (this: any) {
          this.status = BookingStatus.EXPIRED;
        }),
      };

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking as any);

      const mockJob = {
        name: QUEUE_JOBS.RELEASE_UNPAID_BOOKING,
        data: { bookingId: 'booking-999', salonId: 'salon-1' },
      } as unknown as Job;

      await worker.process(mockJob);

      expect(mockBooking.expireHold).toHaveBeenCalledTimes(1);
      expect(mockBookingRepo.update).toHaveBeenCalledWith(mockBooking);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'booking.expired',
        expect.objectContaining({
          bookingId: 'booking-999',
          salonId: 'salon-1',
        }),
      );
    });

    it('ne devrait rien faire si la réservation a été confirmée / payée avant l\'expiration', async () => {
      const mockBooking = {
        id: 'booking-999',
        salonId: 'salon-1',
        customerId: 'customer-1',
        status: BookingStatus.CONFIRMED,
        expireHold: vi.fn(),
      };

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking as any);

      const mockJob = {
        name: QUEUE_JOBS.RELEASE_UNPAID_BOOKING,
        data: { bookingId: 'booking-999', salonId: 'salon-1' },
      } as unknown as Job;

      await worker.process(mockJob);

      expect(mockBooking.expireHold).not.toHaveBeenCalled();
      expect(mockBookingRepo.update).not.toHaveBeenCalled();
    });
  });
});

