import { Inject, Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { IServiceRepository } from '../../../service/domain/repositories/service.repository.interface.js';
import { SERVICE_REPOSITORY } from '../../../service/domain/repositories/service.repository.interface.js';
import type { IStaffRepository } from '../../../staff/domain/repositories/staff.repository.interface.js';
import { STAFF_REPOSITORY } from '../../../staff/domain/repositories/staff.repository.interface.js';
import { AvailabilityQueryDto } from '../dtos/availability-query.dto.js';
import {
  AvailableSlotsResponseDto,
  TimeSlotOptionDto,
} from '../dtos/available-slots-response.dto.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { ServiceVariantNotFoundException } from '../../../service/domain/exceptions/service-domain.exception.js';
import type { StaffBreakEntity } from '../../../staff/domain/entities/staff-break.entity.js';
import type { StaffTimeOffEntity } from '../../../staff/domain/entities/staff-time-off.entity.js';
import type { StaffWorkingHourEntity } from '../../../staff/domain/entities/staff-working-hour.entity.js';

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepo: IServiceRepository,
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    query: AvailabilityQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const variant = await this.serviceRepo.findVariantById(query.variantId);
    if (!variant || !variant.isActive()) {
      throw new ServiceVariantNotFoundException(query.variantId);
    }

    const targetDate = new Date(query.date);
    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth();
    const day = targetDate.getUTCDate();
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday ... 6 = Saturday

    const durations = variant.getDurations();
    const totalEstimatedMinutes = durations.getTotalProjectedMinutes();
    const totalWorstCaseMinutes = durations.getTotalWorstCaseMinutes();

    // 1. Vérification des horaires du salon pour ce jour
    const salonHoursList = await this.salonRepo.findHours(salonId);
    const daySalonHour = salonHoursList.find((h) => h.getDayOfWeek() === dayOfWeek);

    if (!daySalonHour || daySalonHour.isClosed()) {
      return {
        date: query.date,
        variantId: query.variantId,
        totalEstimatedMinutes,
        availableSlots: [],
      };
    }

    // Heure d'ouverture et fermeture du salon
    const [salonOpenHour, salonOpenMin] = daySalonHour.getOpenTime().split(':').map(Number);
    const [salonCloseHour, salonCloseMin] = daySalonHour.getCloseTime().split(':').map(Number);

    const salonOpening = new Date(Date.UTC(year, month, day, salonOpenHour, salonOpenMin, 0));
    const salonClosing = new Date(Date.UTC(year, month, day, salonCloseHour, salonCloseMin, 0));

    // 2. Détermination du personnel candidat
    let candidateStaff = [];
    if (query.staffId) {
      const staffMember = await this.staffRepo.findById(query.staffId);
      if (staffMember && staffMember.getSalonId() === salonId && staffMember.isActive()) {
        candidateStaff.push(staffMember);
      }
    } else {
      const allStaff = await this.staffRepo.findBySalonId(salonId, true);
      candidateStaff = allStaff;
    }

    const availableSlots: TimeSlotOptionDto[] = [];
    const activeBookingStatuses: BookingStatus[] = [
      BookingStatus.CONFIRMED,
      BookingStatus.CHECKED_IN,
      BookingStatus.IN_PROGRESS,
      BookingStatus.PENDING_DEPOSIT,
    ];

    // 3. Parcours pour chaque membre du personnel
    for (const staff of candidateStaff) {
      const workingHoursList: StaffWorkingHourEntity[] = await this.staffRepo.findWorkingHours(staff.getId());
      const staffHours = workingHoursList.find((h) => h.getDayOfWeek() === dayOfWeek);
      if (!staffHours || staffHours.isOff()) continue;

      const [sOpenH, sOpenM] = staffHours.getStartTime().split(':').map(Number);
      const [sCloseH, sCloseM] = staffHours.getEndTime().split(':').map(Number);

      const staffStart = new Date(Date.UTC(year, month, day, sOpenH, sOpenM, 0));
      const staffEnd = new Date(Date.UTC(year, month, day, sCloseH, sCloseM, 0));

      // Bornes effectives de travail (intersection salon & staff)
      const effectiveStart = staffStart > salonOpening ? staffStart : salonOpening;
      const effectiveEnd = staffEnd < salonClosing ? staffEnd : salonClosing;

      // Pauses et congés
      const breaks: StaffBreakEntity[] = await this.staffRepo.findBreaks(staff.getId());
      const timeOffs: StaffTimeOffEntity[] = await this.staffRepo.findTimeOffs(staff.getId());

      // Réservations existantes du staff sur ce jour
      const dayStartBoundary = new Date(Date.UTC(year, month, day, 0, 0, 0));
      const dayEndBoundary = new Date(Date.UTC(year, month, day, 23, 59, 59));
      const staffBookings = await this.bookingRepo.findByStaffAndDateRange(
        staff.getId(),
        dayStartBoundary,
        dayEndBoundary,
      );

      // Boucle par pas de 30 minutes
      let currentSlotStart = new Date(effectiveStart.getTime());
      while (currentSlotStart.getTime() + totalEstimatedMinutes * 60 * 1000 <= effectiveEnd.getTime()) {
        const currentSlotProjectedEnd = new Date(
          currentSlotStart.getTime() + totalEstimatedMinutes * 60 * 1000,
        );
        const currentSlotWorstCaseEnd = new Date(
          currentSlotStart.getTime() + totalWorstCaseMinutes * 60 * 1000,
        );

        // A. Vérifier les pauses
        const inBreak = breaks.some((brk) => {
          if (brk.getDayOfWeek() !== null && brk.getDayOfWeek() !== dayOfWeek) {
            return false;
          }
          const [bStartH, bStartM] = brk.getStartTime().split(':').map(Number);
          const [bEndH, bEndM] = brk.getEndTime().split(':').map(Number);
          const breakStart = new Date(Date.UTC(year, month, day, bStartH, bStartM, 0));
          const breakEnd = new Date(Date.UTC(year, month, day, bEndH, bEndM, 0));

          return currentSlotStart < breakEnd && currentSlotProjectedEnd > breakStart;
        });

        // B. Vérifier les congés
        const inTimeOff = timeOffs.some(
          (to) =>
            to.getStatus() === 'APPROVED' &&
            currentSlotStart < to.getEndDate() &&
            currentSlotProjectedEnd > to.getStartDate(),
        );

        // C. Vérifier les réservations actives
        const inBooking = staffBookings.some((b) => {
          if (!activeBookingStatuses.includes(b.status)) return false;
          if (b.status === BookingStatus.PENDING_DEPOSIT && b.isHoldExpired()) return false;
          return currentSlotStart < b.projectedEnd && currentSlotProjectedEnd > b.scheduledStart;
        });

        if (!inBreak && !inTimeOff && !inBooking) {
          availableSlots.push({
            start: currentSlotStart.toISOString(),
            projectedEnd: currentSlotProjectedEnd.toISOString(),
            worstCaseEnd: currentSlotWorstCaseEnd.toISOString(),
            staffId: staff.getId(),
            staffName: staff.getFullName(),
          });
        }

        // Avancer de 30 minutes
        currentSlotStart = new Date(currentSlotStart.getTime() + 30 * 60 * 1000);
      }
    }

    return {
      date: query.date,
      variantId: query.variantId,
      totalEstimatedMinutes,
      availableSlots,
    };
  }
}
