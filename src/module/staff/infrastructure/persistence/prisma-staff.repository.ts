import { Injectable } from '@nestjs/common';
import { TimeOffStatus as PrismaTimeOffStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IStaffRepository } from '../../domain/repositories/staff.repository.interface.js';
import { StaffEntity } from '../../domain/entities/staff.entity.js';
import { StaffServiceEntity } from '../../domain/entities/staff-service.entity.js';
import { StaffWorkingHourEntity } from '../../domain/entities/staff-working-hour.entity.js';
import { StaffBreakEntity } from '../../domain/entities/staff-break.entity.js';
import { StaffTimeOffEntity, TimeOffStatus } from '../../domain/entities/staff-time-off.entity.js';
import { StaffMapper } from './staff.mapper.js';

@Injectable()
export class PrismaStaffRepository implements IStaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Staff
  public async save(staff: StaffEntity): Promise<void> {
    const data = StaffMapper.toPrismaCreate(staff);
    await this.prisma.staff.create({ data });
  }

  public async findById(id: string): Promise<StaffEntity | null> {
    const raw = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        services: true,
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        breaks: true,
        timeOffs: { orderBy: { startDate: 'desc' } },
      },
    });
    if (!raw) return null;
    return StaffMapper.toDomain(raw);
  }

  public async findBySalonId(salonId: string, onlyActive = true): Promise<StaffEntity[]> {
    const where: Prisma.StaffWhereInput = { salonId };
    if (onlyActive) {
      where.isActive = true;
    }

    const raw = await this.prisma.staff.findMany({
      where,
      include: {
        services: true,
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        breaks: true,
        timeOffs: { orderBy: { startDate: 'desc' } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return raw.map((s) => StaffMapper.toDomain(s));
  }

  public async update(staff: StaffEntity): Promise<void> {
    await this.prisma.staff.update({
      where: { id: staff.getId() },
      data: {
        userId: staff.getUserId(),
        firstName: staff.getFirstName(),
        lastName: staff.getLastName(),
        displayName: staff.getDisplayName(),
        phone: staff.getPhone(),
        avatarUrl: staff.getAvatarUrl(),
        bio: staff.getBio(),
        roleTitle: staff.getRoleTitle(),
        isActive: staff.isActive(),
        updatedAt: staff.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.staff.delete({
      where: { id },
    });
  }

  // Staff Services
  public async saveStaffService(staffService: StaffServiceEntity): Promise<void> {
    const data = StaffMapper.toStaffServicePrismaCreate(staffService);
    await this.prisma.staffService.upsert({
      where: {
        staffId_serviceId_variantId: {
          staffId: staffService.getStaffId(),
          serviceId: staffService.getServiceId(),
          variantId: staffService.getVariantId() ?? '',
        },
      },
      create: data,
      update: {
        customDurationMin: staffService.getCustomDurationMin(),
        customDurationEstimated: staffService.getCustomDurationEstimated(),
        customDurationMax: staffService.getCustomDurationMax(),
        isCapable: staffService.isCapable(),
      },
    });
  }

  public async findStaffServiceById(id: string): Promise<StaffServiceEntity | null> {
    const raw = await this.prisma.staffService.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return StaffMapper.toStaffServiceDomain(raw);
  }

  public async findStaffServices(staffId: string): Promise<StaffServiceEntity[]> {
    const raw = await this.prisma.staffService.findMany({
      where: { staffId },
    });
    return raw.map((s) => StaffMapper.toStaffServiceDomain(s));
  }

  public async updateStaffService(staffService: StaffServiceEntity): Promise<void> {
    await this.prisma.staffService.update({
      where: { id: staffService.getId() },
      data: {
        customDurationMin: staffService.getCustomDurationMin(),
        customDurationEstimated: staffService.getCustomDurationEstimated(),
        customDurationMax: staffService.getCustomDurationMax(),
        isCapable: staffService.isCapable(),
      },
    });
  }

  public async deleteStaffService(id: string): Promise<void> {
    await this.prisma.staffService.delete({
      where: { id },
    });
  }

  // Working Hours
  public async saveWorkingHours(staffId: string, hours: StaffWorkingHourEntity[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const h of hours) {
        await tx.staffWorkingHour.upsert({
          where: {
            staffId_dayOfWeek: {
              staffId,
              dayOfWeek: h.getDayOfWeek(),
            },
          },
          create: {
            id: h.getId(),
            staffId,
            dayOfWeek: h.getDayOfWeek(),
            startTime: h.getStartTime(),
            endTime: h.getEndTime(),
            isOff: h.isOff(),
          },
          update: {
            startTime: h.getStartTime(),
            endTime: h.getEndTime(),
            isOff: h.isOff(),
          },
        });
      }
    });
  }

  public async findWorkingHours(staffId: string): Promise<StaffWorkingHourEntity[]> {
    const raw = await this.prisma.staffWorkingHour.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: 'asc' },
    });
    return raw.map((h) => StaffMapper.toWorkingHourDomain(h));
  }

  // Breaks
  public async saveBreak(staffBreak: StaffBreakEntity): Promise<void> {
    await this.prisma.staffBreak.create({
      data: {
        id: staffBreak.getId(),
        staffId: staffBreak.getStaffId(),
        dayOfWeek: staffBreak.getDayOfWeek(),
        date: staffBreak.getDate(),
        startTime: staffBreak.getStartTime(),
        endTime: staffBreak.getEndTime(),
        reason: staffBreak.getReason(),
      },
    });
  }

  public async findBreakById(id: string): Promise<StaffBreakEntity | null> {
    const raw = await this.prisma.staffBreak.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return StaffMapper.toBreakDomain(raw);
  }

  public async findBreaks(staffId: string): Promise<StaffBreakEntity[]> {
    const raw = await this.prisma.staffBreak.findMany({
      where: { staffId },
    });
    return raw.map((b) => StaffMapper.toBreakDomain(b));
  }

  public async deleteBreak(id: string): Promise<void> {
    await this.prisma.staffBreak.delete({
      where: { id },
    });
  }

  // Time Offs
  public async saveTimeOff(timeOff: StaffTimeOffEntity): Promise<void> {
    await this.prisma.staffTimeOff.create({
      data: {
        id: timeOff.getId(),
        staffId: timeOff.getStaffId(),
        startDate: timeOff.getStartDate(),
        endDate: timeOff.getEndDate(),
        reason: timeOff.getReason(),
        status: timeOff.getStatus() as PrismaTimeOffStatus,
        createdAt: timeOff.getCreatedAt(),
      },
    });
  }

  public async findTimeOffById(id: string): Promise<StaffTimeOffEntity | null> {
    const raw = await this.prisma.staffTimeOff.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return StaffMapper.toTimeOffDomain(raw);
  }

  public async findTimeOffs(staffId: string): Promise<StaffTimeOffEntity[]> {
    const raw = await this.prisma.staffTimeOff.findMany({
      where: { staffId },
      orderBy: { startDate: 'desc' },
    });
    return raw.map((t) => StaffMapper.toTimeOffDomain(t));
  }

  public async updateTimeOffStatus(id: string, status: TimeOffStatus): Promise<void> {
    await this.prisma.staffTimeOff.update({
      where: { id },
      data: { status: status as PrismaTimeOffStatus },
    });
  }

  public async deleteTimeOff(id: string): Promise<void> {
    await this.prisma.staffTimeOff.delete({
      where: { id },
    });
  }
}
