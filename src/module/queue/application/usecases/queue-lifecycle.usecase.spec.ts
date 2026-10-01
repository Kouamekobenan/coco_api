import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueTicketStatus, QueueType } from '@prisma/client';
import { QueueLifecycleUseCase } from './queue-lifecycle.usecase.js';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { TicketNumber } from '../../domain/value-objects/ticket-number.vo.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketCalledEvent,
} from '../../domain/events/queue-ticket.events.js';

describe('QueueLifecycleUseCase', () => {
  let useCase: QueueLifecycleUseCase;
  let mockQueueRepo: IQueueRepository;
  let mockBookingRepo: IBookingRepository;
  let mockCustomerRepo: ICustomerRepository;
  let mockEventEmitter: EventEmitter2;

  const createSampleTicket = (status: QueueTicketStatus = QueueTicketStatus.WAITING) => {
    return new QueueTicketEntity({
      id: 'ticket-123',
      salonId: 'salon-1',
      customerId: 'customer-1',
      bookingId: null,
      queueType: QueueType.WALK_IN,
      ticketNumber: new TicketNumber('W-001'),
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
      findActiveQueue: vi.fn(),
      update: vi.fn().mockImplementation(async (ticket) => ticket),
    } as unknown as IQueueRepository;

    mockBookingRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as IBookingRepository;

    mockCustomerRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as ICustomerRepository;

    mockEventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    useCase = new QueueLifecycleUseCase(
      mockQueueRepo,
      mockBookingRepo,
      mockCustomerRepo,
      mockEventEmitter,
    );
  });

  it('devrait appeler un ticket et émettre l événement QUEUE_EVENT_PATTERNS.TICKET_CALLED', async () => {
    const ticket = createSampleTicket(QueueTicketStatus.WAITING);
    vi.mocked(mockQueueRepo.findById).mockResolvedValue(ticket);

    const result = await useCase.callTicket('salon-1', 'ticket-123', 10);

    expect(result.status).toBe(QueueTicketStatus.CALLED);
    expect(mockQueueRepo.update).toHaveBeenCalledTimes(1);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      QUEUE_EVENT_PATTERNS.TICKET_CALLED,
      expect.any(QueueTicketCalledEvent),
    );

    const emittedEvent = vi.mocked(mockEventEmitter.emit).mock.calls[0][1] as QueueTicketCalledEvent;
    expect(emittedEvent.ticketId).toBe('ticket-123');
    expect(emittedEvent.salonId).toBe('salon-1');
    expect(emittedEvent.ticketNumber).toBe('W-001');
    expect(emittedEvent.graceMinutes).toBe(10);
  });

  it('devrait marquer un ticket en No-Show et émettre QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW', async () => {
    const ticket = createSampleTicket(QueueTicketStatus.CALLED);
    vi.mocked(mockQueueRepo.findById).mockResolvedValue(ticket);

    const result = await useCase.markNoShow('salon-1', 'ticket-123');

    expect(result.status).toBe(QueueTicketStatus.NO_SHOW);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW,
      expect.objectContaining({
        ticketId: 'ticket-123',
        salonId: 'salon-1',
        ticketNumber: 'W-001',
      }),
    );
  });

  it('devrait démarrer la prestation et émettre QUEUE_EVENT_PATTERNS.TICKET_STARTED', async () => {
    const ticket = createSampleTicket(QueueTicketStatus.CALLED);
    vi.mocked(mockQueueRepo.findById).mockResolvedValue(ticket);

    const result = await useCase.startService('salon-1', 'ticket-123');

    expect(result.status).toBe(QueueTicketStatus.IN_SERVICE);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      QUEUE_EVENT_PATTERNS.TICKET_STARTED,
      expect.objectContaining({
        ticketId: 'ticket-123',
        salonId: 'salon-1',
        ticketNumber: 'W-001',
      }),
    );
  });
});
