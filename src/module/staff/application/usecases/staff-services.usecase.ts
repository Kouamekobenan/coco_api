import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface.js';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository.interface.js';
import type { IServiceRepository } from '../../../service/domain/repositories/service.repository.interface.js';
import { SERVICE_REPOSITORY } from '../../../service/domain/repositories/service.repository.interface.js';
import {
  AssignStaffServiceDto,
  StaffServiceResponseDto,
  UpdateStaffServiceDto,
} from '../dtos/staff-service.dto.js';
import { StaffServiceEntity } from '../../domain/entities/staff-service.entity.js';
import {
  StaffNotFoundException,
  StaffServiceNotFoundException,
} from '../../domain/exceptions/staff-domain.exception.js';
import { ServiceNotFoundException } from '../../../service/domain/exceptions/service-domain.exception.js';
import { StaffDtoMapper } from '../dtos/staff-dto.mapper.js';

@Injectable()
export class AssignStaffServiceUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    dto: AssignStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service || service.getSalonId() !== salonId) {
      throw new ServiceNotFoundException(dto.serviceId);
    }

    const staffService = StaffServiceEntity.create({
      id: randomUUID(),
      staffId,
      serviceId: dto.serviceId,
      variantId: dto.variantId,
      customDurationMin: dto.customDurationMin,
      customDurationEstimated: dto.customDurationEstimated,
      customDurationMax: dto.customDurationMax,
      isCapable: dto.isCapable,
    });

    await this.staffRepository.saveStaffService(staffService);
    return StaffDtoMapper.toStaffServiceResponse(staffService);
  }
}

@Injectable()
export class GetStaffServicesUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(salonId: string, staffId: string): Promise<StaffServiceResponseDto[]> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const services = await this.staffRepository.findStaffServices(staffId);
    return services.map((s) => StaffDtoMapper.toStaffServiceResponse(s));
  }
}

@Injectable()
export class UpdateStaffServiceUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    staffServiceId: string,
    dto: UpdateStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const staffService = await this.staffRepository.findStaffServiceById(staffServiceId);
    if (!staffService || staffService.getStaffId() !== staffId) {
      throw new StaffServiceNotFoundException(staffServiceId);
    }

    staffService.update({
      customDurationMin: dto.customDurationMin,
      customDurationEstimated: dto.customDurationEstimated,
      customDurationMax: dto.customDurationMax,
      isCapable: dto.isCapable,
    });

    await this.staffRepository.updateStaffService(staffService);
    return StaffDtoMapper.toStaffServiceResponse(staffService);
  }
}

@Injectable()
export class DeleteStaffServiceUseCase {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(
    salonId: string,
    staffId: string,
    staffServiceId: string,
  ): Promise<{ success: boolean; message: string }> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff || staff.getSalonId() !== salonId) {
      throw new StaffNotFoundException(staffId);
    }

    const staffService = await this.staffRepository.findStaffServiceById(staffServiceId);
    if (!staffService || staffService.getStaffId() !== staffId) {
      throw new StaffServiceNotFoundException(staffServiceId);
    }

    await this.staffRepository.deleteStaffService(staffServiceId);
    return {
      success: true,
      message: `Compétence de service (${staffServiceId}) retirée avec succès au coiffeur.`,
    };
  }
}
