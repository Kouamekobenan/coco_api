import { Injectable } from '@nestjs/common';
import { ResourceType as PrismaResourceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  IResourceRepository,
  ResourceFilterOptions,
} from '../../domain/repositories/resource.repository.interface.js';
import { ResourceEntity } from '../../domain/entities/resource.entity.js';
import { ResourceMapper } from './resource.mapper.js';

@Injectable()
export class PrismaResourceRepository implements IResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(resource: ResourceEntity): Promise<void> {
    const data = ResourceMapper.toPrismaCreate(resource);
    await this.prisma.resource.create({ data });
  }

  public async findById(id: string): Promise<ResourceEntity | null> {
    const raw = await this.prisma.resource.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return ResourceMapper.toDomain(raw);
  }

  public async findBySalonId(salonId: string, options?: ResourceFilterOptions): Promise<ResourceEntity[]> {
    const where: Prisma.ResourceWhereInput = { salonId };

    if (options?.type) {
      where.type = options.type as PrismaResourceType;
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const raw = await this.prisma.resource.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return raw.map((r) => ResourceMapper.toDomain(r));
  }

  public async update(resource: ResourceEntity): Promise<void> {
    await this.prisma.resource.update({
      where: { id: resource.getId() },
      data: {
        name: resource.getName(),
        type: resource.getType() as PrismaResourceType,
        isActive: resource.isActive(),
        updatedAt: resource.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.resource.delete({
      where: { id },
    });
  }
}
