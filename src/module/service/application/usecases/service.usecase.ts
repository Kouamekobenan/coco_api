import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface.js';
import { SERVICE_REPOSITORY } from '../../domain/repositories/service.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { CreateServiceDto, UpdateServiceDto } from '../dtos/create-service.dto.js';
import { ReorderServicesDto } from '../dtos/reorder-services.dto.js';
import { ServiceResponseDto } from '../dtos/service-response.dto.js';
import { ServiceEntity } from '../../domain/entities/service.entity.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { ServiceNotFoundException } from '../../domain/exceptions/service-domain.exception.js';
import { ServiceDtoMapper } from '../dtos/service-dto.mapper.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const service = ServiceEntity.create({
      id: randomUUID(),
      salonId,
      styleId: dto.styleId,
      name: dto.name,
      description: dto.description,
      universe: dto.universe,
      sortOrder: dto.sortOrder,
    });

    await this.serviceRepository.save(service);
    return ServiceDtoMapper.toServiceResponse(service);
  }
}

@Injectable()
export class GetSalonServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, onlyActive = true): Promise<ServiceResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const services = await this.serviceRepository.findBySalonId(salonId, onlyActive);
    return services.map((s) => ServiceDtoMapper.toServiceResponse(s));
  }
}

@Injectable()
export class GetServiceByIdUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException(id);
    }
    return ServiceDtoMapper.toServiceResponse(service);
  }
}

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(
    salonId: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service || service.getSalonId() !== salonId) {
      throw new ServiceNotFoundException(serviceId);
    }

    service.update({
      name: dto.name,
      styleId: dto.styleId,
      description: dto.description,
      universe: dto.universe,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
    });

    await this.serviceRepository.update(service);
    return ServiceDtoMapper.toServiceResponse(service);
  }
}

@Injectable()
export class ReorderServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: ReorderServicesDto): Promise<ServiceResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    await this.serviceRepository.updateSortOrders(salonId, dto.orders);
    const updatedServices = await this.serviceRepository.findBySalonId(salonId, false);
    return updatedServices.map((s) => ServiceDtoMapper.toServiceResponse(s));
  }
}

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(salonId: string, serviceId: string): Promise<{ success: boolean; message: string }> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service || service.getSalonId() !== salonId) {
      throw new ServiceNotFoundException(serviceId);
    }

    await this.serviceRepository.delete(serviceId);
    return {
      success: true,
      message: `Prestation "${service.getName()}" (${serviceId}) supprimée avec succès.`,
    };
  }
}
