import { StaffEntity } from '../../domain/entities/staff.entity.js';
import { StaffResponseDto } from './staff-response.dto.js';
import { StaffServiceEntity } from '../../domain/entities/staff-service.entity.js';
import { StaffServiceResponseDto } from './staff-service.dto.js';
import { StaffWorkingHourEntity } from '../../domain/entities/staff-working-hour.entity.js';
import { StaffWorkingHourResponseDto } from './staff-working-hours.dto.js';
import { StaffBreakEntity } from '../../domain/entities/staff-break.entity.js';
import { StaffBreakResponseDto } from './staff-break.dto.js';
import { StaffTimeOffEntity } from '../../domain/entities/staff-time-off.entity.js';
import { StaffTimeOffResponseDto } from './staff-time-off.dto.js';
import { ResourceEntity } from '../../domain/entities/resource.entity.js';
import { ResourceResponseDto } from './resource.dto.js';

export class StaffDtoMapper {
  public static toStaffResponse(staff: StaffEntity): StaffResponseDto {
    return {
      id: staff.getId(),
      salonId: staff.getSalonId(),
      userId: staff.getUserId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
      displayName: staff.getDisplayName(),
      fullName: staff.getFullName(),
      phone: staff.getPhone(),
      avatarUrl: staff.getAvatarUrl(),
      bio: staff.getBio(),
      roleTitle: staff.getRoleTitle(),
      isActive: staff.isActive(),
      createdAt: staff.getCreatedAt(),
      updatedAt: staff.getUpdatedAt(),
    };
  }

  public static toStaffServiceResponse(staffService: StaffServiceEntity): StaffServiceResponseDto {
    return {
      id: staffService.getId(),
      staffId: staffService.getStaffId(),
      serviceId: staffService.getServiceId(),
      variantId: staffService.getVariantId(),
      customDurationMin: staffService.getCustomDurationMin(),
      customDurationEstimated: staffService.getCustomDurationEstimated(),
      customDurationMax: staffService.getCustomDurationMax(),
      isCapable: staffService.isCapable(),
    };
  }

  public static toWorkingHourResponse(hour: StaffWorkingHourEntity): StaffWorkingHourResponseDto {
    return {
      id: hour.getId(),
      dayOfWeek: hour.getDayOfWeek(),
      startTime: hour.getStartTime(),
      endTime: hour.getEndTime(),
      isOff: hour.isOff(),
    };
  }

  public static toBreakResponse(staffBreak: StaffBreakEntity): StaffBreakResponseDto {
    return {
      id: staffBreak.getId(),
      staffId: staffBreak.getStaffId(),
      dayOfWeek: staffBreak.getDayOfWeek(),
      date: staffBreak.getDate() ? staffBreak.getDate()!.toISOString().split('T')[0] : null,
      startTime: staffBreak.getStartTime(),
      endTime: staffBreak.getEndTime(),
      reason: staffBreak.getReason(),
    };
  }

  public static toTimeOffResponse(timeOff: StaffTimeOffEntity): StaffTimeOffResponseDto {
    return {
      id: timeOff.getId(),
      staffId: timeOff.getStaffId(),
      startDate: timeOff.getStartDate(),
      endDate: timeOff.getEndDate(),
      reason: timeOff.getReason(),
      status: timeOff.getStatus(),
      createdAt: timeOff.getCreatedAt(),
    };
  }

  public static toResourceResponse(resource: ResourceEntity): ResourceResponseDto {
    return {
      id: resource.getId(),
      salonId: resource.getSalonId(),
      name: resource.getName(),
      type: resource.getType(),
      isActive: resource.isActive(),
      createdAt: resource.getCreatedAt(),
    };
  }
}
