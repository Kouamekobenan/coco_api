import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  BookingFilters,
  IBookingRepository,
} from '../../domain/repositories/booking.repository.interface.js';
import { BookingEntity } from '../../domain/entities/booking.entity.js';
import { BookingPhaseEntity } from '../../domain/entities/booking-phase.entity.js';
import { BookingMapper } from './booking.mapper.js';

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<BookingEntity | null> {
    const raw = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!raw) return null;
    return BookingMapper.toEntity(raw);
  }

  public async findByIdempotencyKey(key: string): Promise<BookingEntity | null> {
    const raw = await this.prisma.booking.findUnique({
      where: { idempotencyKey: key },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!raw) return null;
    return BookingMapper.toEntity(raw);
  }

  public async findBySalonId(
    salonId: string,
    filters?: BookingFilters,
  ): Promise<{ bookings: BookingEntity[]; total: number }> {
    const where: Prisma.BookingWhereInput = {
      salonId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.staffId ? { staffId: filters.staffId } : {}),
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            scheduledStart: {
              ...(filters?.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters?.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const [rawList, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          phases: {
            orderBy: { sequenceOrder: 'asc' },
          },
        },
        orderBy: { scheduledStart: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 20,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings: rawList.map((r) => BookingMapper.toEntity(r)),
      total,
    };
  }

  public async findByStaffAndDateRange(
    staffId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<BookingEntity[]> {
    const rawList = await this.prisma.booking.findMany({
      where: {
        staffId,
        scheduledStart: { lt: end },
        projectedEnd: { gt: start },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    });

    return rawList.map((r) => BookingMapper.toEntity(r));
  }

  public async findByResourceAndDateRange(
    resourceId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<BookingPhaseEntity[]> {
    const rawPhases = await this.prisma.bookingPhase.findMany({
      where: {
        resourceId,
        booking: {
          scheduledStart: { lt: end },
          projectedEnd: { gt: start },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        },
      },
      orderBy: { sequenceOrder: 'asc' },
    });

    return rawPhases.map((p) => BookingMapper.toPhaseEntity(p));
  }

  public async save(booking: BookingEntity): Promise<BookingEntity> {
    const data = BookingMapper.toPrismaCreate(booking);
    const raw = await this.prisma.booking.create({
      data,
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    return BookingMapper.toEntity(raw);
  }

  public async update(booking: BookingEntity): Promise<BookingEntity> {
    const data = BookingMapper.toPrismaUpdate(booking);
    const raw = await this.prisma.booking.update({
      where: { id: booking.id },
      data,
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    return BookingMapper.toEntity(raw);
  }

  public async findExpiredHolds(now: Date): Promise<BookingEntity[]> {
    const rawList = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_DEPOSIT,
        holdExpiresAt: { lt: now },
      },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    return rawList.map((r) => BookingMapper.toEntity(r));
  }

  public async findPhaseById(phaseId: string): Promise<BookingPhaseEntity | null> {
    const raw = await this.prisma.bookingPhase.findUnique({
      where: { id: phaseId },
    });

    if (!raw) return null;
    return BookingMapper.toPhaseEntity(raw);
  }

  public async savePhase(phase: BookingPhaseEntity): Promise<BookingPhaseEntity> {
    const raw = await this.prisma.bookingPhase.create({
      data: {
        id: phase.id,
        bookingId: phase.bookingId,
        phaseType: phase.phaseType,
        name: phase.name,
        sequenceOrder: phase.sequenceOrder,
        durationMinutes: phase.durationMinutes,
        resourceId: phase.resourceId,
        startedAt: phase.startedAt,
        endedAt: phase.endedAt,
      },
    });

    return BookingMapper.toPhaseEntity(raw);
  }

  public async updatePhase(phase: BookingPhaseEntity): Promise<BookingPhaseEntity> {
    const raw = await this.prisma.bookingPhase.update({
      where: { id: phase.id },
      data: {
        phaseType: phase.phaseType,
        name: phase.name,
        sequenceOrder: phase.sequenceOrder,
        durationMinutes: phase.durationMinutes,
        resourceId: phase.resourceId,
        startedAt: phase.startedAt,
        endedAt: phase.endedAt,
      },
    });

    return BookingMapper.toPhaseEntity(raw);
  }

  public async deletePhase(phaseId: string): Promise<void> {
    await this.prisma.bookingPhase.delete({
      where: { id: phaseId },
    });
  }
}
