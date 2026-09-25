import { Inject, Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { BookingQueryDto } from '../dtos/booking-query.dto.js';
import { BookingListResponseDto } from '../dtos/booking-response.dto.js';
import { BookingDtoMapper } from '../dtos/booking-dto.mapper.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class SearchBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    query: BookingQueryDto,
  ): Promise<BookingListResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { bookings, total } = await this.bookingRepo.findBySalonId(salonId, {
      status: query.status,
      staffId: query.staffId,
      customerId: query.customerId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      skip,
      take: limit,
    });

    return {
      items: bookings.map((b) => BookingDtoMapper.toResponseDto(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
