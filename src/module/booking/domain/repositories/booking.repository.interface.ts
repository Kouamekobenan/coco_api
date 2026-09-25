import { BookingStatus } from '@prisma/client';
import { BookingEntity } from '../entities/booking.entity.js';
import { BookingPhaseEntity } from '../entities/booking-phase.entity.js';

export interface BookingFilters {
  status?: BookingStatus;
  staffId?: string;
  customerId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;
  take?: number;
}

export interface IBookingRepository {
  findById(id: string): Promise<BookingEntity | null>;
  findByIdempotencyKey(key: string): Promise<BookingEntity | null>;
  findBySalonId(
    salonId: string,
    filters?: BookingFilters,
  ): Promise<{ bookings: BookingEntity[]; total: number }>;
  findByStaffAndDateRange(
    staffId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<BookingEntity[]>;
  findByResourceAndDateRange(
    resourceId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<BookingPhaseEntity[]>;
  save(booking: BookingEntity): Promise<BookingEntity>;
  update(booking: BookingEntity): Promise<BookingEntity>;
  findExpiredHolds(now: Date): Promise<BookingEntity[]>;
  
  // Phase methods
  findPhaseById(phaseId: string): Promise<BookingPhaseEntity | null>;
  savePhase(phase: BookingPhaseEntity): Promise<BookingPhaseEntity>;
  updatePhase(phase: BookingPhaseEntity): Promise<BookingPhaseEntity>;
  deletePhase(phaseId: string): Promise<void>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
