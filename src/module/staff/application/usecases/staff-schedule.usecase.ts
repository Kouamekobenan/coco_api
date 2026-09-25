import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface.js';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository.interface.js';
import {
  StaffWorkingHourResponseDto,
  UpdateStaffWorkingHoursDto,
} from '../dtos/staff-working-hours.dto.js';
import {
  CreateStaffBreakDto,
  StaffBreakResponseDto,
} from '../dtos/staff-break.dto.js';
import {
  CreateStaffTimeOffDto,
  StaffTimeOffResponseDto,
  UpdateStaffTimeOffStatusDto,
} from '../dtos/staff-time-off.dto.js';
import { StaffWorkingHourEntity } from '../../domain/entities/staff-working-hour.entity.js';
import { StaffBreakEntity } from '../../domain/entities/staff-break.entity.js';
import { StaffTimeOffEntity } from '../../domain/entities/staff-time-off.entity.js';
import {
  StaffBreakNotFoundException,
  StaffNotFoundException,
  StaffTimeOffNotFoundException,
} from '../../domain/exceptions/staff-domain.exception.js';
import { StaffDtoMapper } from '../dtos/staff-dto.mapper.js';

@Injectable()
export class GetStaffScheduleUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(salonId: string, staffId: string): Promise<{
    workingHours: StaffWorkingHourResponseDto[];
    breaks: StaffBreakResponseDto[];
    timeOffs: StaffTimeOffResponseDto[];
  }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const [workingHours, breaks, timeOffs] = await Promise.all([
      this.staffRepository.findWorkingHours(staffId),
      this.staffRepository.findBreaks(staffId),
      this.staffRepository.findTimeOffs(staffId),
    ]);

    return {
      workingHours: workingHours.map((h) => StaffDtoMapper.toWorkingHourResponse(h)),
      breaks: breaks.map((b) => StaffDtoMapper.toBreakResponse(b)),
      timeOffs: timeOffs.map((t) => StaffDtoMapper.toTimeOffResponse(t)),
    };
  }
}

@Injectable()
export class UpdateStaffWorkingHoursUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    dto: UpdateStaffWorkingHoursDto,
  ): Promise<StaffWorkingHourResponseDto[]> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const entities = dto.hours.map((h) =>
      StaffWorkingHourEntity.create({
        id: randomUUID(),
        staffId,
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        isOff: h.isOff,
      }),
    );

    await this.staffRepository.saveWorkingHours(staffId, entities);
    const updated = await this.staffRepository.findWorkingHours(staffId);
    return updated.map((h) => StaffDtoMapper.toWorkingHourResponse(h));
  }
}

@Injectable()
export class CreateStaffBreakUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    dto: CreateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const staffBreak = StaffBreakEntity.create({
      id: randomUUID(),
      staffId,
      dayOfWeek: dto.dayOfWeek,
      date: dto.date ? new Date(dto.date) : null,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    await this.staffRepository.saveBreak(staffBreak);
    return StaffDtoMapper.toBreakResponse(staffBreak);
  }
}

@Injectable()
export class DeleteStaffBreakUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    breakId: string,
  ): Promise<{ success: boolean; message: string }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const staffBreak = await this.staffRepository.findBreakById(breakId);
    if (!staffBreak || staffBreak.getStaffId() !== staffId) {
      throw new StaffBreakNotFoundException(breakId);
    }

    await this.staffRepository.deleteBreak(breakId);
    return {
      success: true,
      message: `Pause (${breakId}) supprimée avec succès.`,
    };
  }
}

@Injectable()
export class CreateStaffTimeOffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    dto: CreateStaffTimeOffDto,
  ): Promise<StaffTimeOffResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const timeOff = StaffTimeOffEntity.create({
      id: randomUUID(),
      staffId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason,
    });

    await this.staffRepository.saveTimeOff(timeOff);
    return StaffDtoMapper.toTimeOffResponse(timeOff);
  }
}

@Injectable()
export class UpdateStaffTimeOffStatusUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    timeOffId: string,
    dto: UpdateStaffTimeOffStatusDto,
  ): Promise<{ success: boolean; status: string; message: string }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const timeOff = await this.staffRepository.findTimeOffById(timeOffId);
    if (!timeOff || timeOff.getStaffId() !== staffId) {
      throw new StaffTimeOffNotFoundException(timeOffId);
    }

    await this.staffRepository.updateTimeOffStatus(timeOffId, dto.status);
    return {
      success: true,
      status: dto.status,
      message: `Demande de congé mise à jour avec le statut: ${dto.status}.`,
    };
  }
}

@Injectable()
export class DeleteStaffTimeOffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    timeOffId: string,
  ): Promise<{ success: boolean; message: string }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const timeOff = await this.staffRepository.findTimeOffById(timeOffId);
    if (!timeOff || timeOff.getStaffId() !== staffId) {
      throw new StaffTimeOffNotFoundException(timeOffId);
    }

    await this.staffRepository.deleteTimeOff(timeOffId);
    return {
      success: true,
      message: `Demande de congé (${timeOffId}) supprimée avec succès.`,
    };
  }
}
