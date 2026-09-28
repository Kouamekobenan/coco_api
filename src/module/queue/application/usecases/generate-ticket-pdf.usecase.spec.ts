import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateTicketPdfUseCase } from './generate-ticket-pdf.usecase.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { TicketNumber } from '../../domain/value-objects/ticket-number.vo.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';
import { QueueTicketNotFoundException } from '../../domain/exceptions/queue-domain.exception.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';

describe('GenerateTicketPdfUseCase', () => {
  let useCase: GenerateTicketPdfUseCase;
  let mockQueueRepo: { findById: ReturnType<typeof vi.fn> };
  let mockSalonRepo: { findById: ReturnType<typeof vi.fn> };
  let mockCustomerRepo: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockQueueRepo = { findById: vi.fn() };
    mockSalonRepo = { findById: vi.fn() };
    mockCustomerRepo = { findById: vi.fn() };

    useCase = new GenerateTicketPdfUseCase(
      mockQueueRepo as unknown as IQueueRepository,
      mockSalonRepo as unknown as ISalonRepository,
      mockCustomerRepo as unknown as ICustomerRepository,
    );
  });

  it('should throw QueueTicketNotFoundException if ticket does not exist', async () => {
    mockQueueRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-ticket-id')).rejects.toThrow(
      QueueTicketNotFoundException,
    );
  });

  it('should throw SalonNotFoundException if salon does not exist', async () => {
    const mockTicket = new QueueTicketEntity({
      id: 'ticket-1',
      salonId: 'salon-1',
      customerId: 'customer-1',
      queueType: 'WALK_IN',
      ticketNumber: new TicketNumber('W-001'),
      status: 'WAITING',
      estimate: QueueWaitEstimate.create(15, 20),
      qrCodeToken: 'tok-123456',
    });

    mockQueueRepo.findById.mockResolvedValue(mockTicket);
    mockSalonRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ticket-1')).rejects.toThrow(
      SalonNotFoundException,
    );
  });

  it('should generate a valid PDF buffer when ticket and salon exist', async () => {
    const mockTicket = new QueueTicketEntity({
      id: 'ticket-1',
      salonId: 'salon-1',
      customerId: 'customer-1',
      queueType: 'WALK_IN',
      ticketNumber: new TicketNumber('W-001'),
      status: 'WAITING',
      estimate: QueueWaitEstimate.create(10, 20),
      qrCodeToken: 'tok-123456',
    });

    const mockSalon = {
      getName: () => 'Salon Coiffure Chic',
      getCommune: () => 'Cocody',
      getQuartier: () => 'Angré 7ème tranche',
      getPhone: () => '+2250700000000',
    };

    const mockCustomer = {
      getName: () => 'Marie Kouadio',
    };

    mockQueueRepo.findById.mockResolvedValue(mockTicket);
    mockSalonRepo.findById.mockResolvedValue(mockSalon);
    mockCustomerRepo.findById.mockResolvedValue(mockCustomer);

    const buffer = await useCase.execute('ticket-1');

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    // Vérification de la signature du fichier PDF (%PDF-)
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  });
});
