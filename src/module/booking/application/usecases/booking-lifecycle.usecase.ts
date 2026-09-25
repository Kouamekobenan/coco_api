import { Inject, Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingNotFoundException } from '../../domain/exceptions/booking-domain.exception.js';

@Injectable()
export class BookingLifecycleUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  private async getBookingOrThrow(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }
    return booking;
  }

  public async confirmDeposit(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.confirmDeposit(new Date());
    return await this.bookingRepo.update(booking);
  }

  public async checkIn(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.checkIn();
    return await this.bookingRepo.update(booking);
  }

  public async startBooking(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.start(new Date());
    return await this.bookingRepo.update(booking);
  }

  public async completeBooking(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.complete(new Date());
    const updatedBooking = await this.bookingRepo.update(booking);

    // Synchronisation CRM automatique: enregistrer la visite et le chiffre d'affaires du client
    try {
      const customer = await this.customerRepo.findById(booking.customerId);
      if (customer) {
        customer.recordVisit(booking.totalPrice);
        await this.customerRepo.update(customer);
      }
    } catch {
      // Ignorer l'erreur CRM secondaire pour ne pas bloquer la complétion de la réservation
    }

    return updatedBooking;
  }

  public async cancelBooking(
    salonId: string,
    bookingId: string,
    reason?: string,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.cancel(reason, new Date());
    return await this.bookingRepo.update(booking);
  }

  public async markNoShow(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.markNoShow();
    return await this.bookingRepo.update(booking);
  }

  public async updateDelay(
    salonId: string,
    bookingId: string,
    delayMinutes: number,
    isAlertSent = false,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.updateDelay(delayMinutes, isAlertSent);
    return await this.bookingRepo.update(booking);
  }
}
