import {
  Staff as PrismaStaff,
  StaffService as PrismaStaffService,
  StaffWorkingHour as PrismaWorkingHour,
  StaffBreak as PrismaBreak,
  StaffTimeOff as PrismaTimeOff,
  Prisma,
} from '@prisma/client';
import { StaffEntity } from '../../domain/entities/staff.entity.js';
import { StaffServiceEntity } from '../../domain/entities/staff-service.entity.js';
import { StaffWorkingHourEntity } from '../../domain/entities/staff-working-hour.entity.js';
import { StaffBreakEntity } from '../../domain/entities/staff-break.entity.js';
import { StaffTimeOffEntity, TimeOffStatus } from '../../domain/entities/staff-time-off.entity.js';

type PrismaStaffWithRelations = PrismaStaff & {
  services?: PrismaStaffService[];
  workingHours?: PrismaWorkingHour[];
  breaks?: PrismaBreak[];
  timeOffs?: PrismaTimeOff[];
};

export class StaffMapper {
  public static toDomain(raw: PrismaStaffWithRelations): StaffEntity {
    const staff = StaffEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      userId: raw.userId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      displayName: raw.displayName,
      phone: raw.phone,
      avatarUrl: raw.avatarUrl,
      bio: raw.bio,
      roleTitle: raw.roleTitle,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      services: raw.services ? raw.services.map((s) => this.toStaffServiceDomain(s)) : [],
      workingHours: raw.workingHours ? raw.workingHours.map((h) => this.toWorkingHourDomain(h)) : [],
      breaks: raw.breaks ? raw.breaks.map((b) => this.toBreakDomain(b)) : [],
      timeOffs: raw.timeOffs ? raw.timeOffs.map((t) => this.toTimeOffDomain(t)) : [],
    });

    return staff;
  }

  public static toPrismaCreate(staff: StaffEntity): Prisma.StaffUncheckedCreateInput {
    return {
      id: staff.getId(),
      salonId: staff.getSalonId(),
      userId: staff.getUserId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
      displayName: staff.getDisplayName(),
      phone: staff.getPhone(),
      avatarUrl: staff.getAvatarUrl(),
      bio: staff.getBio(),
      roleTitle: staff.getRoleTitle(),
      isActive: staff.isActive(),
      createdAt: staff.getCreatedAt(),
      updatedAt: staff.getUpdatedAt(),
    };
  }

  public static toStaffServiceDomain(raw: PrismaStaffService): StaffServiceEntity {
    return StaffServiceEntity.reconstitute({
      id: raw.id,
      staffId: raw.staffId,
      serviceId: raw.serviceId,
      variantId: raw.variantId,
      customDurationMin: raw.customDurationMin,
      customDurationEstimated: raw.customDurationEstimated,
      customDurationMax: raw.customDurationMax,
      isCapable: raw.isCapable,
    });
  }

  public static toStaffServicePrismaCreate(entity: StaffServiceEntity): Prisma.StaffServiceUncheckedCreateInput {
    return {
      id: entity.getId(),
      staffId: entity.getStaffId(),
      serviceId: entity.getServiceId(),
      variantId: entity.getVariantId(),
      customDurationMin: entity.getCustomDurationMin(),
      customDurationEstimated: entity.getCustomDurationEstimated(),
      customDurationMax: entity.getCustomDurationMax(),
      isCapable: entity.isCapable(),
    };
  }

  public static toWorkingHourDomain(raw: PrismaWorkingHour): StaffWorkingHourEntity {
    return StaffWorkingHourEntity.reconstitute({
      id: raw.id,
      staffId: raw.staffId,
      dayOfWeek: raw.dayOfWeek,
      startTime: raw.startTime,
      endTime: raw.endTime,
      isOff: raw.isOff,
    });
  }

  public static toBreakDomain(raw: PrismaBreak): StaffBreakEntity {
    return StaffBreakEntity.reconstitute({
      id: raw.id,
      staffId: raw.staffId,
      dayOfWeek: raw.dayOfWeek,
      date: raw.date,
      startTime: raw.startTime,
      endTime: raw.endTime,
      reason: raw.reason,
    });
  }

  public static toTimeOffDomain(raw: PrismaTimeOff): StaffTimeOffEntity {
    return StaffTimeOffEntity.reconstitute({
      id: raw.id,
      staffId: raw.staffId,
      startDate: raw.startDate,
      endDate: raw.endDate,
      reason: raw.reason,
      status: raw.status as TimeOffStatus,
      createdAt: raw.createdAt,
    });
  }
}
