import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BookingStatus, DepositRuleType } from '@prisma/client';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { IServiceRepository } from '../../../service/domain/repositories/service.repository.interface.js';
import { SERVICE_REPOSITORY } from '../../../service/domain/repositories/service.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import type { IStaffRepository } from '../../../staff/domain/repositories/staff.repository.interface.js';
import { STAFF_REPOSITORY } from '../../../staff/domain/repositories/staff.repository.interface.js';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingTimeSlot } from '../../domain/value-objects/booking-time-slot.vo.js';
import { CreateBookingDto } from '../dtos/create-booking.dto.js';
import {
  BookingSlotUnavailableException,
} from '../../domain/exceptions/booking-domain.exception.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { ServiceVariantNotFoundException } from '../../../service/domain/exceptions/service-domain.exception.js';
import { SalonCustomerNotFoundException } from '../../../customer/domain/exceptions/customer-domain.exception.js';
import { StaffNotFoundException } from '../../../staff/domain/exceptions/staff-domain.exception.js';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepo: IServiceRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository,
  ) {}

  public async execute(salonId: string, dto: CreateBookingDto): Promise<BookingEntity> {
    // 1. Idempotency Check (Protection coupures réseau)
    const existingBooking = await this.bookingRepo.findByIdempotencyKey(dto.idempotencyKey);
    if (existingBooking) {
      return existingBooking;
    }

    // 2. Vérification Salon
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    // 3. Vérification Client CRM
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(dto.customerId);
    }

    // 4. Vérification Variante de Service
    const variant = await this.serviceRepo.findVariantById(dto.variantId);
    if (!variant || !variant.isActive()) {
      throw new ServiceVariantNotFoundException(dto.variantId);
    }

    const durations = variant.getDurations();

    // 5. Calcul des horaires prévisionnels et pire des cas
    const start = new Date(dto.scheduledStart);
    const timeSlot = BookingTimeSlot.calculate(
      start,
      durations.getSetup(),
      durations.getEstimated(),
      durations.getMax(),
      durations.getBuffer(),
    );

    // 6. Vérification disponibilité du staff (si renseigné)
    if (dto.staffId) {
      const staff = await this.staffRepo.findById(dto.staffId);
      if (!staff || staff.getSalonId() !== salonId || !staff.isActive()) {
        throw new StaffNotFoundException(dto.staffId);
      }

      // Vérifier horaires de travail pour ce jour (0 = Sunday ... 6 = Saturday)
      const dayOfWeek = start.getUTCDay();
      const workingHours = await this.staffRepo.findWorkingHours(dto.staffId);
      const todayHours = workingHours.find((h) => h.getDayOfWeek() === dayOfWeek);

      if (!todayHours || todayHours.isOff()) {
        throw new BookingSlotUnavailableException(
          `Le membre du personnel n'est pas en service ce jour.`,
        );
      }

      // Vérifier congés / absences approuvés
      const timeOffs = await this.staffRepo.findTimeOffs(dto.staffId);
      const hasConflictTimeOff = timeOffs.some(
        (to) =>
          to.getStatus() === 'APPROVED' &&
          timeSlot.overlaps(to.getStartDate(), to.getEndDate()),
      );
      if (hasConflictTimeOff) {
        throw new BookingSlotUnavailableException(
          'Le coiffeur sélectionné est en congé ou indisponible sur ce créneau.',
        );
      }

      // Vérifier chevauchement avec d'autres réservations actives du staff
      const existingStaffBookings = await this.bookingRepo.findByStaffAndDateRange(
        dto.staffId,
        new Date(start.getTime() - 24 * 60 * 60 * 1000),
        new Date(start.getTime() + 24 * 60 * 60 * 1000),
      );

      const activeStatuses: BookingStatus[] = [
        BookingStatus.CONFIRMED,
        BookingStatus.CHECKED_IN,
        BookingStatus.IN_PROGRESS,
        BookingStatus.PENDING_DEPOSIT,
      ];

      const hasConflict = existingStaffBookings.some((b) => {
        if (!activeStatuses.includes(b.status)) return false;
        // Si le verrou de hold d'acompte a expiré, on ignore le créneau
        if (b.status === BookingStatus.PENDING_DEPOSIT && b.isHoldExpired()) return false;
        return timeSlot.overlaps(b.scheduledStart, b.projectedEnd);
      });

      if (hasConflict) {
        throw new BookingSlotUnavailableException(
          'Le coiffeur sélectionné a déjà un rendez-vous planifié sur ce créneau horaire.',
        );
      }
    }

    // 7. Calcul du prix et de l'acompte
    const totalPrice = dto.totalPrice ?? variant.getPrice().getFrom();
    let depositAmount = 0;
    if (variant.isRequiresDeposit()) {
      if (variant.getDepositRule() === DepositRuleType.PERCENTAGE) {
        depositAmount = Math.round((totalPrice * variant.getDepositAmount()) / 100);
      } else {
        depositAmount = variant.getDepositAmount();
      }
    }

    // 8. Détermination statut & délai de hold (15 minutes si acompte requis)
    const requiresDeposit = depositAmount > 0;
    const status = requiresDeposit ? BookingStatus.PENDING_DEPOSIT : BookingStatus.CONFIRMED;
    const holdExpiresAt = requiresDeposit
      ? new Date(Date.now() + 15 * 60 * 1000)
      : null;
    const isDepositPaid = !requiresDeposit;

    // 9. Création de l'entité
    const booking = new BookingEntity({
      id: randomUUID(),
      idempotencyKey: dto.idempotencyKey,
      salonId,
      customerId: dto.customerId,
      userId: dto.userId ?? null,
      variantId: dto.variantId,
      staffId: dto.staffId ?? null,
      status,
      timeSlot,
      depositAmount,
      totalPrice,
      isDepositPaid,
      depositPaidAt: isDepositPaid ? new Date() : null,
      holdExpiresAt,
      clientNotes: dto.clientNotes ?? null,
    });

    return await this.bookingRepo.save(booking);
  }
}
