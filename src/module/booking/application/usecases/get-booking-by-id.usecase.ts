import { Inject, Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingNotFoundException } from '../../domain/exceptions/booking-domain.exception.js';

@Injectable()
export class GetBookingByIdUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
  ) {}

  public async execute(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }
    return booking;
  }
}
