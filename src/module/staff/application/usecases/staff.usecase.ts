import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface.js';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { CreateStaffDto, UpdateStaffDto } from '../dtos/create-staff.dto.js';
import { StaffResponseDto } from '../dtos/staff-response.dto.js';
import { StaffEntity } from '../../domain/entities/staff.entity.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { StaffNotFoundException } from '../../domain/exceptions/staff-domain.exception.js';
import { StaffDtoMapper } from '../dtos/staff-dto.mapper.js';

@Injectable()
export class CreateStaffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: CreateStaffDto): Promise<StaffResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const staff = StaffEntity.create({
      id: randomUUID(),
      salonId,
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      roleTitle: dto.roleTitle,
    });

    await this.staffRepository.save(staff);
    return StaffDtoMapper.toStaffResponse(staff);
  }
}

@Injectable()
export class GetSalonStaffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, onlyActive = true): Promise<StaffResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const staffList = await this.staffRepository.findBySalonId(salonId, onlyActive);
    return staffList.map((s) => StaffDtoMapper.toStaffResponse(s));
  }
}

@Injectable()
export class GetStaffByIdUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(id: string): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new StaffNotFoundException(id);
    }
    return StaffDtoMapper.toStaffResponse(staff);
  }
}

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    dto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    staff.updateProfile({
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      roleTitle: dto.roleTitle,
      isActive: dto.isActive,
    });

    await this.staffRepository.update(staff);
    return StaffDtoMapper.toStaffResponse(staff);
  }
}

@Injectable()
export class DeleteStaffUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(salonId: string, staffId: string): Promise<{ success: boolean; message: string }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    await this.staffRepository.delete(staffId);
    return {
      success: true,
      message: `Membre du staff "${staff.getFullName()}" (${staffId}) supprimé avec succès.`,
    };
  }
}
