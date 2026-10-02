import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerSyncEventListener } from './customer-sync-event.listener.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import {
  BookingCompletedEvent,
  BookingNoShowEvent,
} from '../../../booking/domain/events/booking.events.js';

describe('CustomerSyncEventListener', () => {
  let listener: CustomerSyncEventListener;
  let mockCustomerRepo: ICustomerRepository;

  beforeEach(() => {
    mockCustomerRepo = {
      findById: vi.fn(),
      update: vi.fn().mockImplementation(async (c) => c),
      saveNote: vi.fn().mockResolvedValue(undefined),
    } as unknown as ICustomerRepository;

    listener = new CustomerSyncEventListener(mockCustomerRepo);
  });

  describe('handleBookingCompleted', () => {
    it('devrait enregistrer la visite et mettre à jour le chiffre d\'affaires du client', async () => {
      const mockCustomer = {
        getId: () => 'cust-1',
        getName: () => 'Aïcha Traoré',
        getSegment: () => 'VIP',
        getTotalSpent: () => 150000,
        recordVisit: vi.fn(),
      };

      vi.mocked(mockCustomerRepo.findById).mockResolvedValue(mockCustomer as any);

      const event = new BookingCompletedEvent(
        'booking-1',
        'salon-1',
        'cust-1',
        25000,
        new Date(),
      );

      await listener.handleBookingCompleted(event);

      expect(mockCustomer.recordVisit).toHaveBeenCalledWith(25000, event.completedAt);
      expect(mockCustomerRepo.update).toHaveBeenCalledWith(mockCustomer);
    });
  });

  describe('handleBookingNoShow', () => {
    it('devrait ajouter une note d\'incident No-Show sur la fiche CRM du client', async () => {
      const mockCustomer = {
        getId: () => 'cust-1',
        getName: () => 'Aïcha Traoré',
      };

      vi.mocked(mockCustomerRepo.findById).mockResolvedValue(mockCustomer as any);

      const event = new BookingNoShowEvent(
        'booking-1',
        'salon-1',
        'cust-1',
        new Date(),
      );

      await listener.handleBookingNoShow(event);

      expect(mockCustomerRepo.saveNote).toHaveBeenCalledTimes(1);
      expect(mockCustomerRepo.saveNote).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            authorId: 'SYSTEM',
            salonId: 'salon-1',
            salonCustomerId: 'cust-1',
            isPrivate: true,
          }),
        }),
      );
    });
  });
});
