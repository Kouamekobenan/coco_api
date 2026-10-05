import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateBookingUseCase } from './create-booking.usecase.js';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { IServiceRepository } from '../../../service/domain/repositories/service.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import type { IStaffRepository } from '../../../staff/domain/repositories/staff.repository.interface.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DistributedLockService } from '../../../../common/lock/distributed-lock.service.js';
import { BookingSlotUnavailableException } from '../../domain/exceptions/booking-domain.exception.js';

describe('CreateBookingUseCase - Protection Anti-Race Condition', () => {
  let useCase: CreateBookingUseCase;
  let mockBookingRepo: Partial<IBookingRepository>;
  let mockSalonRepo: Partial<ISalonRepository>;
  let mockServiceRepo: Partial<IServiceRepository>;
  let mockCustomerRepo: Partial<ICustomerRepository>;
  let mockStaffRepo: Partial<IStaffRepository>;
  let mockEventEmitter: Partial<EventEmitter2>;
  let mockLockService: Partial<DistributedLockService>;

  beforeEach(() => {
    mockBookingRepo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(null),
      findByStaffAndDateRange: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    mockSalonRepo = {
      findById: vi.fn().mockResolvedValue({ id: 'salon-1' }),
    };

    mockCustomerRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'cust-1',
        getSalonId: () => 'salon-1',
      }),
    };

    mockServiceRepo = {
      findVariantById: vi.fn().mockResolvedValue({
        id: 'var-1',
        isActive: () => true,
        getDurations: () => ({
          getSetup: () => 0,
          getEstimated: () => 45,
          getMax: () => 60,
          getBuffer: () => 15,
        }),
        getPrice: () => ({ getFrom: () => 5000 }),
        isRequiresDeposit: () => false,
      }),
    };

    mockStaffRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'staff-1',
        getSalonId: () => 'salon-1',
        isActive: () => true,
      }),
      findWorkingHours: vi.fn().mockResolvedValue([
        { getDayOfWeek: () => new Date('2026-10-10T10:00:00Z').getUTCDay(), isOff: () => false },
      ]),
      findTimeOffs: vi.fn().mockResolvedValue([]),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockLockService = {
      withLock: vi.fn().mockImplementation(async (_key, fn) => fn()),
    };

    useCase = new CreateBookingUseCase(
      mockBookingRepo as IBookingRepository,
      mockSalonRepo as ISalonRepository,
      mockServiceRepo as IServiceRepository,
      mockCustomerRepo as ICustomerRepository,
      mockStaffRepo as IStaffRepository,
      mockEventEmitter as EventEmitter2,
      mockLockService as DistributedLockService,
    );
  });

  it('doit acquérir le verrou distribué spécifique au coiffeur lors de la réservation', async () => {
    const dto = {
      idempotencyKey: 'idem-1',
      customerId: 'cust-1',
      variantId: 'var-1',
      staffId: 'staff-1',
      scheduledStart: '2026-10-10T10:00:00Z',
    };

    const booking = await useCase.execute('salon-1', dto);

    expect(mockLockService.withLock).toHaveBeenCalledWith(
      'lock:booking:staff:staff-1',
      expect.any(Function),
      7000,
      15,
      150,
    );
    expect(booking).toBeDefined();
    expect(mockBookingRepo.save).toHaveBeenCalledTimes(1);
  });

  it('doit lever BookingSlotUnavailableException si le verrou ne peut pas être acquis (ressource occupée)', async () => {
    mockLockService.withLock = vi.fn().mockRejectedValue(
      new Error('LOCK_ACQUISITION_TIMEOUT: Impossible d\'acquérir le verrou'),
    );

    const dto = {
      idempotencyKey: 'idem-2',
      customerId: 'cust-1',
      variantId: 'var-1',
      staffId: 'staff-1',
      scheduledStart: '2026-10-10T10:00:00Z',
    };

    await expect(useCase.execute('salon-1', dto)).rejects.toThrow(
      BookingSlotUnavailableException,
    );
  });
});
