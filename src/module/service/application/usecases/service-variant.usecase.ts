import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IServiceRepository } from '../../domain/repositories/service.repository.interface.js';
import { SERVICE_REPOSITORY } from '../../domain/repositories/service.repository.interface.js';
import {
  CreateServiceVariantDto,
  UpdateServiceVariantDto,
} from '../dtos/create-service-variant.dto.js';
import { ServiceVariantResponseDto } from '../dtos/service-variant-response.dto.js';
import { ServiceVariantEntity } from '../../domain/entities/service-variant.entity.js';
import { ServiceDurations } from '../../domain/value-objects/service-durations.vo.js';
import { ServicePrice } from '../../domain/value-objects/service-price.vo.js';
import {
  ServiceNotFoundException,
  ServiceVariantNotFoundException,
} from '../../domain/exceptions/service-domain.exception.js';
import { ServiceDtoMapper } from '../dtos/service-dto.mapper.js';

@Injectable()
export class CreateServiceVariantUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(
    serviceId: string,
    dto: CreateServiceVariantDto,
  ): Promise<ServiceVariantResponseDto> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new ServiceNotFoundException(serviceId);
    }

    const durations = new ServiceDurations(
      dto.durationMin,
      dto.durationEstimated,
      dto.durationMax,
      dto.setupMinutes,
      dto.bufferMinutes,
    );

    const price = new ServicePrice(dto.priceFrom, dto.priceTo);

    const variant = ServiceVariantEntity.create({
      id: randomUUID(),
      serviceId,
      name: dto.name,
      durations,
      price,
      requiresConsultation: dto.requiresConsultation,
      requiresDeposit: dto.requiresDeposit,
      depositRule: dto.depositRule,
      depositAmount: dto.depositAmount,
      requiresOwnMaterials: dto.requiresOwnMaterials,
      requiredResourceType: dto.requiredResourceType,
    });

    await this.serviceRepository.saveVariant(variant);
    return ServiceDtoMapper.toVariantResponse(variant);
  }
}

@Injectable()
export class GetServiceVariantsUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(serviceId: string, onlyActive = true): Promise<ServiceVariantResponseDto[]> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new ServiceNotFoundException(serviceId);
    }

    const variants = await this.serviceRepository.findVariantsByServiceId(serviceId, onlyActive);
    return variants.map((v) => ServiceDtoMapper.toVariantResponse(v));
  }
}

@Injectable()
export class GetServiceVariantByIdUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(serviceId: string, variantId: string): Promise<ServiceVariantResponseDto> {
    const variant = await this.serviceRepository.findVariantById(variantId);
    if (!variant || variant.getServiceId() !== serviceId) {
      throw new ServiceVariantNotFoundException(variantId);
    }

    return ServiceDtoMapper.toVariantResponse(variant);
  }
}

@Injectable()
export class UpdateServiceVariantUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(
    serviceId: string,
    variantId: string,
    dto: UpdateServiceVariantDto,
  ): Promise<ServiceVariantResponseDto> {
    const variant = await this.serviceRepository.findVariantById(variantId);
    if (!variant || variant.getServiceId() !== serviceId) {
      throw new ServiceVariantNotFoundException(variantId);
    }

    let durations: ServiceDurations | undefined;
    if (
      dto.durationMin !== undefined ||
      dto.durationEstimated !== undefined ||
      dto.durationMax !== undefined ||
      dto.setupMinutes !== undefined ||
      dto.bufferMinutes !== undefined
    ) {
      durations = new ServiceDurations(
        dto.durationMin ?? variant.getDurations().getMin(),
        dto.durationEstimated ?? variant.getDurations().getEstimated(),
        dto.durationMax ?? variant.getDurations().getMax(),
        dto.setupMinutes ?? variant.getDurations().getSetup(),
        dto.bufferMinutes ?? variant.getDurations().getBuffer(),
      );
    }

    let price: ServicePrice | undefined;
    if (dto.priceFrom !== undefined || dto.priceTo !== undefined) {
      price = new ServicePrice(
        dto.priceFrom ?? variant.getPrice().getFrom(),
        dto.priceTo !== undefined ? dto.priceTo : variant.getPrice().getTo(),
      );
    }

    variant.update({
      name: dto.name,
      durations,
      price,
      requiresConsultation: dto.requiresConsultation,
      requiresDeposit: dto.requiresDeposit,
      depositRule: dto.depositRule,
      depositAmount: dto.depositAmount,
      requiresOwnMaterials: dto.requiresOwnMaterials,
      requiredResourceType: dto.requiredResourceType,
      isActive: dto.isActive,
    });

    await this.serviceRepository.updateVariant(variant);
    return ServiceDtoMapper.toVariantResponse(variant);
  }
}

@Injectable()
export class DeleteServiceVariantUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  public async execute(serviceId: string, variantId: string): Promise<{ success: boolean; message: string }> {
    const variant = await this.serviceRepository.findVariantById(variantId);
    if (!variant || variant.getServiceId() !== serviceId) {
      throw new ServiceVariantNotFoundException(variantId);
    }

    await this.serviceRepository.deleteVariant(variantId);
    return {
      success: true,
      message: `Variante "${variant.getName()}" (${variantId}) supprimée avec succès.`,
    };
  }
}
