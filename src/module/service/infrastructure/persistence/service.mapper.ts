import {
  Service as PrismaService,
  ServiceVariant as PrismaVariant,
  Style as PrismaStyle,
  AppUniverse as PrismaAppUniverse,
  DepositRuleType as PrismaDepositRule,
  ResourceType as PrismaResourceType,
  Prisma,
} from '@prisma/client';
import { ServiceEntity } from '../../domain/entities/service.entity.js';
import {
  ServiceVariantEntity,
  DepositRuleType,
  ResourceType,
} from '../../domain/entities/service-variant.entity.js';
import { ServiceDurations } from '../../domain/value-objects/service-durations.vo.js';
import { ServicePrice } from '../../domain/value-objects/service-price.vo.js';
import { StyleMapper } from './style.mapper.js';
import { AppUniverseType } from '../../domain/entities/style.entity.js';

type PrismaServiceWithRelations = PrismaService & {
  style?: PrismaStyle | null;
  variants?: PrismaVariant[];
};

export class ServiceMapper {
  public static toDomain(raw: PrismaServiceWithRelations): ServiceEntity {
    const service = ServiceEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      styleId: raw.styleId,
      name: raw.name,
      description: raw.description,
      universe: raw.universe as AppUniverseType,
      isActive: raw.isActive,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      style: raw.style ? StyleMapper.toDomain(raw.style) : null,
      variants: raw.variants ? raw.variants.map((v) => this.toVariantDomain(v)) : [],
    });

    return service;
  }

  public static toPrismaCreate(service: ServiceEntity): Prisma.ServiceUncheckedCreateInput {
    return {
      id: service.getId(),
      salonId: service.getSalonId(),
      styleId: service.getStyleId(),
      name: service.getName(),
      description: service.getDescription(),
      universe: service.getUniverse() as PrismaAppUniverse,
      isActive: service.isActive(),
      sortOrder: service.getSortOrder(),
      createdAt: service.getCreatedAt(),
      updatedAt: service.getUpdatedAt(),
    };
  }

  public static toVariantDomain(raw: PrismaVariant): ServiceVariantEntity {
    const durations = new ServiceDurations(
      raw.durationMin,
      raw.durationEstimated,
      raw.durationMax,
      raw.setupMinutes,
      raw.bufferMinutes,
    );

    const price = new ServicePrice(
      raw.priceFrom.toNumber(),
      raw.priceTo ? raw.priceTo.toNumber() : null,
    );

    return ServiceVariantEntity.reconstitute({
      id: raw.id,
      serviceId: raw.serviceId,
      name: raw.name,
      durations,
      price,
      requiresConsultation: raw.requiresConsultation,
      requiresDeposit: raw.requiresDeposit,
      depositRule: raw.depositRule as DepositRuleType,
      depositAmount: raw.depositAmount.toNumber(),
      requiresOwnMaterials: raw.requiresOwnMaterials,
      isLongService: raw.isLongService,
      requiredResourceType: raw.requiredResourceType as ResourceType | null,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toVariantPrismaCreate(variant: ServiceVariantEntity): Prisma.ServiceVariantUncheckedCreateInput {
    return {
      id: variant.getId(),
      serviceId: variant.getServiceId(),
      name: variant.getName(),
      durationMin: variant.getDurations().getMin(),
      durationEstimated: variant.getDurations().getEstimated(),
      durationMax: variant.getDurations().getMax(),
      setupMinutes: variant.getDurations().getSetup(),
      bufferMinutes: variant.getDurations().getBuffer(),
      priceFrom: new Prisma.Decimal(variant.getPrice().getFrom()),
      priceTo: variant.getPrice().getTo() !== null ? new Prisma.Decimal(variant.getPrice().getTo()!) : null,
      requiresConsultation: variant.isRequiresConsultation(),
      requiresDeposit: variant.isRequiresDeposit(),
      depositRule: variant.getDepositRule() as PrismaDepositRule,
      depositAmount: new Prisma.Decimal(variant.getDepositAmount()),
      requiresOwnMaterials: variant.isRequiresOwnMaterials(),
      isLongService: variant.isLongService(),
      requiredResourceType: variant.getRequiredResourceType() as PrismaResourceType | null,
      isActive: variant.isActive(),
      createdAt: variant.getCreatedAt(),
      updatedAt: variant.getUpdatedAt(),
    };
  }
}
