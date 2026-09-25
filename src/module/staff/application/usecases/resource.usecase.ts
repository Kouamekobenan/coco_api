import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IResourceRepository } from '../../domain/repositories/resource.repository.interface.js';
import { RESOURCE_REPOSITORY } from '../../domain/repositories/resource.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import {
  CreateResourceDto,
  ResourceResponseDto,
  UpdateResourceDto,
} from '../dtos/resource.dto.js';
import { ResourceEntity, ResourceType } from '../../domain/entities/resource.entity.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { ResourceNotFoundException } from '../../domain/exceptions/staff-domain.exception.js';
import { StaffDtoMapper } from '../dtos/staff-dto.mapper.js';

@Injectable()
export class CreateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: CreateResourceDto): Promise<ResourceResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const resource = ResourceEntity.create({
      id: randomUUID(),
      salonId,
      name: dto.name,
      type: dto.type,
    });

    await this.resourceRepository.save(resource);
    return StaffDtoMapper.toResourceResponse(resource);
  }
}

@Injectable()
export class GetSalonResourcesUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    filter?: { type?: ResourceType; isActive?: boolean },
  ): Promise<ResourceResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const resources = await this.resourceRepository.findBySalonId(salonId, filter);
    return resources.map((r) => StaffDtoMapper.toResourceResponse(r));
  }
}

@Injectable()
export class GetResourceByIdUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  public async execute(id: string): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new ResourceNotFoundException(id);
    }
    return StaffDtoMapper.toResourceResponse(resource);
  }
}

@Injectable()
export class UpdateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  public async execute(
    salonId: string,
    resourceId: string,
    dto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource || resource.getSalonId() !== salonId) {
      throw new ResourceNotFoundException(resourceId);
    }

    resource.update({
      name: dto.name,
      type: dto.type,
      isActive: dto.isActive,
    });

    await this.resourceRepository.update(resource);
    return StaffDtoMapper.toResourceResponse(resource);
  }
}

@Injectable()
export class DeleteResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  public async execute(salonId: string, resourceId: string): Promise<{ success: boolean; message: string }> {
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource || resource.getSalonId() !== salonId) {
      throw new ResourceNotFoundException(resourceId);
    }

    await this.resourceRepository.delete(resourceId);
    return {
      success: true,
      message: `Ressource "${resource.getName()}" (${resourceId}) supprimée avec succès.`,
    };
  }
}
