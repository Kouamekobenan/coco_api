import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpiredHoldsScheduler } from './expired-holds.scheduler.js';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import type { BookingLifecycleUseCase } from '../../application/usecases/booking-lifecycle.usecase.js';

describe('ExpiredHoldsScheduler', () => {
  let scheduler: ExpiredHoldsScheduler;
  let mockBookingRepo: Partial<IBookingRepository>;
  let mockLifecycleUseCase: Partial<BookingLifecycleUseCase>;

  beforeEach(() => {
    mockBookingRepo = {
      findExpiredHolds: vi.fn().mockResolvedValue([]),
    };

    mockLifecycleUseCase = {
      expireHold: vi.fn().mockResolvedValue(null),
    };

    scheduler = new ExpiredHoldsScheduler(
      mockBookingRepo as IBookingRepository,
      mockLifecycleUseCase as BookingLifecycleUseCase,
    );
  });

  it('ne doit rien faire s\'il n\'y a aucune réservation expirée', async () => {
    await scheduler.handleExpiredHoldsSweep();

    expect(mockBookingRepo.findExpiredHolds).toHaveBeenCalled();
    expect(mockLifecycleUseCase.expireHold).not.toHaveBeenCalled();
  });

  it('doit libérer chaque réservation dont l\'acompte a expiré', async () => {
    mockBookingRepo.findExpiredHolds = vi.fn().mockResolvedValue([
      { id: 'b-1', salonId: 'salon-1' },
      { id: 'b-2', salonId: 'salon-2' },
    ]);

    await scheduler.handleExpiredHoldsSweep();

    expect(mockBookingRepo.findExpiredHolds).toHaveBeenCalled();
    expect(mockLifecycleUseCase.expireHold).toHaveBeenCalledTimes(2);
    expect(mockLifecycleUseCase.expireHold).toHaveBeenCalledWith('b-1');
    expect(mockLifecycleUseCase.expireHold).toHaveBeenCalledWith('b-2');
  });
});
