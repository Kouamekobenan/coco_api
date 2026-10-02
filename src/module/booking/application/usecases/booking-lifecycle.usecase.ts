import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingNotFoundException } from '../../domain/exceptions/booking-domain.exception.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingCancelledEvent,
  BookingCheckedInEvent,
  BookingCompletedEvent,
  BookingDelayUpdatedEvent,
  BookingDepositConfirmedEvent,
  BookingNoShowEvent,
  BookingStartedEvent,
} from '../../domain/events/booking.events.js';

@Injectable()
export class BookingLifecycleUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
    private readonly eventEmitter: EventEmitter2,
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
    const paidAt = new Date();
    booking.confirmDeposit(paidAt);
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_DEPOSIT_CONFIRMED,
      new BookingDepositConfirmedEvent(
        updated.id,
        updated.salonId,
        updated.customerId,
        updated.depositAmount,
        paidAt,
      ),
    );

    return updated;
  }

  public async checkIn(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.checkIn();
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_CHECKED_IN,
      new BookingCheckedInEvent(updated.id, updated.salonId, updated.customerId),
    );

    return updated;
  }

  public async startBooking(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    const startAt = new Date();
    booking.start(startAt);
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_STARTED,
      new BookingStartedEvent(updated.id, updated.salonId, updated.customerId, startAt),
    );

    return updated;
  }

  public async completeBooking(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    const completedAt = new Date();
    booking.complete(completedAt);
    const updatedBooking = await this.bookingRepo.update(booking);

    // Synchronisation CRM automatique: enregistrer la visite et le chiffre d'affaires du client
    try {
      const customer = await this.customerRepo.findById(booking.customerId);
      if (customer) {
        customer.recordVisit(booking.totalPrice, completedAt);
        await this.customerRepo.update(customer);
      }
    } catch {
      // Ignorer l'erreur CRM secondaire pour ne pas bloquer la complétion de la réservation
    }

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_COMPLETED,
      new BookingCompletedEvent(
        updatedBooking.id,
        updatedBooking.salonId,
        updatedBooking.customerId,
        updatedBooking.totalPrice,
        completedAt,
      ),
    );

    return updatedBooking;
  }

  public async cancelBooking(
    salonId: string,
    bookingId: string,
    reason?: string,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    const cancelledAt = new Date();
    booking.cancel(reason, cancelledAt);
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_CANCELLED,
      new BookingCancelledEvent(
        updated.id,
        updated.salonId,
        updated.customerId,
        reason,
        cancelledAt,
      ),
    );

    return updated;
  }

  public async markNoShow(salonId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    const markedAt = new Date();
    booking.markNoShow();
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_NO_SHOW,
      new BookingNoShowEvent(updated.id, updated.salonId, updated.customerId, markedAt),
    );

    return updated;
  }

  public async updateDelay(
    salonId: string,
    bookingId: string,
    delayMinutes: number,
    isAlertSent = false,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingOrThrow(salonId, bookingId);
    booking.updateDelay(delayMinutes, isAlertSent);
    const updated = await this.bookingRepo.update(booking);

    this.eventEmitter.emit(
      BOOKING_EVENT_PATTERNS.BOOKING_DELAY_UPDATED,
      new BookingDelayUpdatedEvent(
        updated.id,
        updated.salonId,
        updated.customerId,
        delayMinutes,
        isAlertSent,
      ),
    );

    return updated;
  }
}
