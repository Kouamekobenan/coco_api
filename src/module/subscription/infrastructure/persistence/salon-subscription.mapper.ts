import { SalonSubscription as PrismaSalonSubscription } from '@prisma/client';
import { SalonSubscriptionEntity } from '../../domain/entities/salon-subscription.entity.js';

export type RawPrismaSubscriptionWithRelations = PrismaSalonSubscription & {
  salon?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    coverUrl: string | null;
    commune: string;
    quartier: string;
    averageRating: number;
    reviewCount: number;
  } | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
    avatarUrl: string | null;
  } | null;
};

export class SalonSubscriptionMapper {
  public static toDomain(raw: RawPrismaSubscriptionWithRelations): SalonSubscriptionEntity {
    return SalonSubscriptionEntity.reconstitute({
      id: raw.id,
      userId: raw.userId,
      salonId: raw.salonId,
      notifyPromos: raw.notifyPromos,
      notifyStories: raw.notifyStories,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      salonDetails: raw.salon
        ? {
            name: raw.salon.name,
            slug: raw.salon.slug,
            logoUrl: raw.salon.logoUrl,
            coverUrl: raw.salon.coverUrl,
            commune: raw.salon.commune,
            quartier: raw.salon.quartier,
            averageRating: raw.salon.averageRating,
            reviewCount: raw.salon.reviewCount,
          }
        : undefined,
      userDetails: raw.user
        ? {
            firstName: raw.user.firstName,
            lastName: raw.user.lastName,
            phone: raw.user.phone,
            avatarUrl: raw.user.avatarUrl,
          }
        : undefined,
    });
  }

  public static toPrismaCreate(entity: SalonSubscriptionEntity): {
    id: string;
    userId: string;
    salonId: string;
    notifyPromos: boolean;
    notifyStories: boolean;
  } {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      salonId: entity.getSalonId(),
      notifyPromos: entity.isNotifyPromos(),
      notifyStories: entity.isNotifyStories(),
    };
  }

  public static toPrismaUpdate(entity: SalonSubscriptionEntity): {
    notifyPromos: boolean;
    notifyStories: boolean;
    updatedAt: Date;
  } {
    return {
      notifyPromos: entity.isNotifyPromos(),
      notifyStories: entity.isNotifyStories(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
