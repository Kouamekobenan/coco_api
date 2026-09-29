import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SalonSubscriptionEntity } from '../../domain/entities/salon-subscription.entity.js';
import {
  RawPrismaSubscriptionWithRelations,
  SalonSubscriptionMapper,
} from './salon-subscription.mapper.js';

@Injectable()
export class PrismaSalonSubscriptionRepository implements ISalonSubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(subscription: SalonSubscriptionEntity): Promise<SalonSubscriptionEntity> {
    const data = SalonSubscriptionMapper.toPrismaCreate(subscription);
    const raw = (await this.prisma.salonSubscription.create({
      data,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            coverUrl: true,
            commune: true,
            quartier: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    })) as RawPrismaSubscriptionWithRelations;

    return SalonSubscriptionMapper.toDomain(raw);
  }

  public async update(subscription: SalonSubscriptionEntity): Promise<SalonSubscriptionEntity> {
    const data = SalonSubscriptionMapper.toPrismaUpdate(subscription);
    const raw = (await this.prisma.salonSubscription.update({
      where: {
        userId_salonId: {
          userId: subscription.getUserId(),
          salonId: subscription.getSalonId(),
        },
      },
      data,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            coverUrl: true,
            commune: true,
            quartier: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    })) as RawPrismaSubscriptionWithRelations;

    return SalonSubscriptionMapper.toDomain(raw);
  }

  public async delete(userId: string, salonId: string): Promise<boolean> {
    await this.prisma.salonSubscription.delete({
      where: {
        userId_salonId: {
          userId,
          salonId,
        },
      },
    });
    return true;
  }

  public async findByUserAndSalon(
    userId: string,
    salonId: string,
  ): Promise<SalonSubscriptionEntity | null> {
    const raw = (await this.prisma.salonSubscription.findUnique({
      where: {
        userId_salonId: {
          userId,
          salonId,
        },
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            coverUrl: true,
            commune: true,
            quartier: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    })) as RawPrismaSubscriptionWithRelations | null;

    if (!raw) {
      return null;
    }
    return SalonSubscriptionMapper.toDomain(raw);
  }

  public async findUserSubscriptions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SalonSubscriptionEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.prisma.salonSubscription.count({
        where: { userId },
      }),
      this.prisma.salonSubscription.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          salon: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              coverUrl: true,
              commune: true,
              quartier: true,
              averageRating: true,
              reviewCount: true,
            },
          },
        },
      }),
    ]);

    const items = (records as RawPrismaSubscriptionWithRelations[]).map((r) =>
      SalonSubscriptionMapper.toDomain(r),
    );

    return { items, total };
  }

  public async findSalonSubscribers(
    salonId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SalonSubscriptionEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.prisma.salonSubscription.count({
        where: { salonId },
      }),
      this.prisma.salonSubscription.findMany({
        where: { salonId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const items = (records as RawPrismaSubscriptionWithRelations[]).map((r) =>
      SalonSubscriptionMapper.toDomain(r),
    );

    return { items, total };
  }

  public async countBySalonId(salonId: string): Promise<number> {
    return this.prisma.salonSubscription.count({
      where: { salonId },
    });
  }

  public async countByUserId(userId: string): Promise<number> {
    return this.prisma.salonSubscription.count({
      where: { userId },
    });
  }
}
