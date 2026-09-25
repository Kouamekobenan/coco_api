import { Resource as PrismaResource, ResourceType as PrismaResourceType, Prisma } from '@prisma/client';
import { ResourceEntity, ResourceType } from '../../domain/entities/resource.entity.js';

export class ResourceMapper {
  public static toDomain(raw: PrismaResource): ResourceEntity {
    return ResourceEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      name: raw.name,
      type: raw.type as ResourceType,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(resource: ResourceEntity): Prisma.ResourceUncheckedCreateInput {
    return {
      id: resource.getId(),
      salonId: resource.getSalonId(),
      name: resource.getName(),
      type: resource.getType() as PrismaResourceType,
      isActive: resource.isActive(),
      createdAt: resource.getCreatedAt(),
      updatedAt: resource.getUpdatedAt(),
    };
  }
}
