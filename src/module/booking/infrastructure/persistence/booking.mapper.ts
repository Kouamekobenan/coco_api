import {
  Booking as PrismaBooking,
  BookingPhase as PrismaBookingPhase,
  Prisma,
} from '@prisma/client';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingPhaseEntity } from '../../domain/entities/booking-phase.entity.js';
import { BookingTimeSlot } from '../../domain/value-objects/booking-time-slot.vo.js';

type PrismaBookingWithPhases = PrismaBooking & {
  phases?: PrismaBookingPhase[];
};

export class BookingMapper {
  public static toPhaseEntity(raw: PrismaBookingPhase): BookingPhaseEntity {
    return new BookingPhaseEntity({
      id: raw.id,
      bookingId: raw.bookingId,
      phaseType: raw.phaseType,
      name: raw.name,
      sequenceOrder: raw.sequenceOrder,
      durationMinutes: raw.durationMinutes,
      resourceId: raw.resourceId,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
    });
  }

  public static toEntity(raw: PrismaBookingWithPhases): BookingEntity {
    const timeSlot = new BookingTimeSlot(
      raw.scheduledStart,
      raw.projectedEnd,
      raw.worstCaseEnd,
    );

    const phases = (raw.phases ?? []).map((p) => this.toPhaseEntity(p));

    return new BookingEntity({
      id: raw.id,
      idempotencyKey: raw.idempotencyKey,
      salonId: raw.salonId,
      customerId: raw.customerId,
      userId: raw.userId,
      variantId: raw.variantId,
      staffId: raw.staffId,
      status: raw.status,
      timeSlot,
      actualStart: raw.actualStart,
      actualEnd: raw.actualEnd,
      delayMinutes: raw.delayMinutes,
      isDelayAlertSent: raw.isDelayAlertSent,
      depositAmount: Number(raw.depositAmount),
      totalPrice: Number(raw.totalPrice),
      isDepositPaid: raw.isDepositPaid,
      depositPaidAt: raw.depositPaidAt,
      holdExpiresAt: raw.holdExpiresAt,
      cancellationReason: raw.cancellationReason,
      cancelledAt: raw.cancelledAt,
      rescheduledFromId: raw.rescheduledFromId,
      clientNotes: raw.clientNotes,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(entity: BookingEntity): Prisma.BookingCreateInput {
    return {
      id: entity.id,
      idempotencyKey: entity.idempotencyKey,
      status: entity.status,
      scheduledStart: entity.scheduledStart,
      projectedEnd: entity.projectedEnd,
      worstCaseEnd: entity.worstCaseEnd,
      actualStart: entity.actualStart,
      actualEnd: entity.actualEnd,
      delayMinutes: entity.delayMinutes,
      isDelayAlertSent: entity.isDelayAlertSent,
      depositAmount: new Prisma.Decimal(entity.depositAmount),
      totalPrice: new Prisma.Decimal(entity.totalPrice),
      isDepositPaid: entity.isDepositPaid,
      depositPaidAt: entity.depositPaidAt,
      holdExpiresAt: entity.holdExpiresAt,
      cancellationReason: entity.cancellationReason,
      cancelledAt: entity.cancelledAt,
      rescheduledFromId: entity.rescheduledFromId,
      clientNotes: entity.clientNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      salon: {
        connect: { id: entity.salonId },
      },
      customer: {
        connect: { id: entity.customerId },
      },
      variant: {
        connect: { id: entity.variantId },
      },
      ...(entity.userId ? { user: { connect: { id: entity.userId } } } : {}),
      ...(entity.staffId ? { staff: { connect: { id: entity.staffId } } } : {}),
    };
  }

  public static toPrismaUpdate(entity: BookingEntity): Prisma.BookingUpdateInput {
    return {
      status: entity.status,
      scheduledStart: entity.scheduledStart,
      projectedEnd: entity.projectedEnd,
      worstCaseEnd: entity.worstCaseEnd,
      actualStart: entity.actualStart,
      actualEnd: entity.actualEnd,
      delayMinutes: entity.delayMinutes,
      isDelayAlertSent: entity.isDelayAlertSent,
      depositAmount: new Prisma.Decimal(entity.depositAmount),
      totalPrice: new Prisma.Decimal(entity.totalPrice),
      isDepositPaid: entity.isDepositPaid,
      depositPaidAt: entity.depositPaidAt,
      holdExpiresAt: entity.holdExpiresAt,
      cancellationReason: entity.cancellationReason,
      cancelledAt: entity.cancelledAt,
      rescheduledFromId: entity.rescheduledFromId,
      clientNotes: entity.clientNotes,
      updatedAt: entity.updatedAt,
      ...(entity.staffId
        ? { staff: { connect: { id: entity.staffId } } }
        : { staff: { disconnect: true } }),
    };
  }
}
