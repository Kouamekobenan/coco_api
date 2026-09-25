import { Injectable } from '@nestjs/common';
import {
  AppUniverse as PrismaAppUniverse,
  DepositRuleType as PrismaDepositRule,
  ResourceType as PrismaResourceType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IServiceRepository } from '../../domain/repositories/service.repository.interface.js';
import { ServiceEntity } from '../../domain/entities/service.entity.js';
import { ServiceVariantEntity } from '../../domain/entities/service-variant.entity.js';
import { ServiceMapper } from './service.mapper.js';

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Service
  public async save(service: ServiceEntity): Promise<void> {
    const data = ServiceMapper.toPrismaCreate(service);
    await this.prisma.service.create({ data });
  }

  public async findById(id: string): Promise<ServiceEntity | null> {
    const raw = await this.prisma.service.findUnique({
      where: { id },
      include: {
        style: true,
        variants: {
          orderBy: { priceFrom: 'asc' },
        },
      },
    });
    if (!raw) return null;
    return ServiceMapper.toDomain(raw);
  }

  public async findBySalonId(salonId: string, onlyActive = true): Promise<ServiceEntity[]> {
    const where: Prisma.ServiceWhereInput = { salonId };
    if (onlyActive) {
      where.isActive = true;
    }

    const raw = await this.prisma.service.findMany({
      where,
      include: {
        style: true,
        variants: {
          where: onlyActive ? { isActive: true } : undefined,
          orderBy: { priceFrom: 'asc' },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return raw.map((s) => ServiceMapper.toDomain(s));
  }

  public async update(service: ServiceEntity): Promise<void> {
    await this.prisma.service.update({
      where: { id: service.getId() },
      data: {
        name: service.getName(),
        styleId: service.getStyleId(),
        description: service.getDescription(),
        universe: service.getUniverse() as PrismaAppUniverse,
        isActive: service.isActive(),
        sortOrder: service.getSortOrder(),
        updatedAt: service.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }

  public async updateSortOrders(
    salonId: string,
    orders: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map((item) =>
        this.prisma.service.updateMany({
          where: { id: item.id, salonId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }

  // Variantes
  public async saveVariant(variant: ServiceVariantEntity): Promise<void> {
    const data = ServiceMapper.toVariantPrismaCreate(variant);
    await this.prisma.serviceVariant.create({ data });
  }

  public async findVariantById(variantId: string): Promise<ServiceVariantEntity | null> {
    const raw = await this.prisma.serviceVariant.findUnique({
      where: { id: variantId },
    });
    if (!raw) return null;
    return ServiceMapper.toVariantDomain(raw);
  }

  public async findVariantsByServiceId(serviceId: string, onlyActive = true): Promise<ServiceVariantEntity[]> {
    const where: Prisma.ServiceVariantWhereInput = { serviceId };
    if (onlyActive) {
      where.isActive = true;
    }

    const raw = await this.prisma.serviceVariant.findMany({
      where,
      orderBy: { priceFrom: 'asc' },
    });

    return raw.map((v) => ServiceMapper.toVariantDomain(v));
  }

  public async updateVariant(variant: ServiceVariantEntity): Promise<void> {
    await this.prisma.serviceVariant.update({
      where: { id: variant.getId() },
      data: {
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
        updatedAt: variant.getUpdatedAt(),
      },
    });
  }

  public async deleteVariant(variantId: string): Promise<void> {
    await this.prisma.serviceVariant.delete({
      where: { id: variantId },
    });
  }
}
