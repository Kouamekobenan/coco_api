import { Style as PrismaStyle, AppUniverse as PrismaAppUniverse, Prisma } from '@prisma/client';
import { StyleEntity, AppUniverseType } from '../../domain/entities/style.entity.js';

export class StyleMapper {
  public static toDomain(raw: PrismaStyle): StyleEntity {
    return StyleEntity.reconstitute({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      universe: raw.universe as AppUniverseType,
      description: raw.description,
      imageUrl: raw.imageUrl,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(style: StyleEntity): Prisma.StyleCreateInput {
    return {
      id: style.getId(),
      name: style.getName(),
      slug: style.getSlug(),
      universe: style.getUniverse() as PrismaAppUniverse,
      description: style.getDescription(),
      imageUrl: style.getImageUrl(),
      isActive: style.isActive(),
      createdAt: style.getCreatedAt(),
      updatedAt: style.getUpdatedAt(),
    };
  }
}
