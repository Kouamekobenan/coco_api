import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingPhaseEntity } from '../../domain/entities/booking-phase.entity.js';
import {
  BookingPhaseResponseDto,
  BookingResponseDto,
} from './booking-response.dto.js';

export class BookingDtoMapper {
  public static toPhaseResponseDto(phase: BookingPhaseEntity): BookingPhaseResponseDto {
    return {
      id: phase.id,
      bookingId: phase.bookingId,
      phaseType: phase.phaseType,
      name: phase.name,
      sequenceOrder: phase.sequenceOrder,
      durationMinutes: phase.durationMinutes,
      resourceId: phase.resourceId,
      startedAt: phase.startedAt ? phase.startedAt.toISOString() : null,
      endedAt: phase.endedAt ? phase.endedAt.toISOString() : null,
    };
  }

  public static toResponseDto(booking: BookingEntity): BookingResponseDto {
    return {
      id: booking.id,
      idempotencyKey: booking.idempotencyKey,
      salonId: booking.salonId,
      customerId: booking.customerId,
      userId: booking.userId,
      variantId: booking.variantId,
      staffId: booking.staffId,
      status: booking.status,
      scheduledStart: booking.scheduledStart.toISOString(),
      projectedEnd: booking.projectedEnd.toISOString(),
      worstCaseEnd: booking.worstCaseEnd.toISOString(),
      actualStart: booking.actualStart ? booking.actualStart.toISOString() : null,
      actualEnd: booking.actualEnd ? booking.actualEnd.toISOString() : null,
      delayMinutes: booking.delayMinutes,
      isDelayAlertSent: booking.isDelayAlertSent,
      depositAmount: booking.depositAmount,
      totalPrice: booking.totalPrice,
      isDepositPaid: booking.isDepositPaid,
      depositPaidAt: booking.depositPaidAt ? booking.depositPaidAt.toISOString() : null,
      holdExpiresAt: booking.holdExpiresAt ? booking.holdExpiresAt.toISOString() : null,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
      rescheduledFromId: booking.rescheduledFromId,
      clientNotes: booking.clientNotes,
      phases: booking.phases.map((p) => this.toPhaseResponseDto(p)),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
