import {
  Salon as PrismaSalon,
  SalonExperienceConfig as PrismaConfig,
  SalonHour as PrismaHour,
  SalonHourException as PrismaException,
  SalonMedia as PrismaMedia,
  SalonPromotion as PrismaPromotion,
  AppUniverse as PrismaAppUniverse,
  SalonStatus as PrismaSalonStatus,
  Prisma,
} from '@prisma/client';
import { SalonEntity, AppUniverseType, SalonStatusType } from '../../domain/entities/salon.entity.js';
import { SalonSlug } from '../../domain/value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonExperienceConfigEntity, BookingModeType } from '../../domain/entities/salon-experience-config.entity.js';
import { SalonHourEntity } from '../../domain/entities/salon-hour.entity.js';
import { SalonHourExceptionEntity } from '../../domain/entities/salon-hour-exception.entity.js';
import { SalonMediaEntity } from '../../domain/entities/salon-media.entity.js';
import { SalonPromotionEntity, DiscountType } from '../../domain/entities/salon-promotion.entity.js';

type PrismaSalonWithRelations = PrismaSalon & {
  experienceConfig?: PrismaConfig | null;
  hours?: PrismaHour[];
  hourExceptions?: PrismaException[];
  media?: PrismaMedia[];
  promotions?: PrismaPromotion[];
};

export class SalonMapper {
  public static toDomain(raw: PrismaSalonWithRelations): SalonEntity {
    const slug = new SalonSlug(raw.slug);
    const coordinates = new SalonCoordinates(raw.latitude, raw.longitude);

    const salon = SalonEntity.reconstitute({
      id: raw.id,
      name: raw.name,
      slug,
      phone: raw.phone,
      whatsappPhone: raw.whatsappPhone,
      email: raw.email,
      description: raw.description,
      universe: raw.universe as AppUniverseType,
      status: raw.status as SalonStatusType,
      commune: raw.commune,
      quartier: raw.quartier,
      landmark: raw.landmark,
      coordinates,
      address: raw.address,
      coverUrl: raw.coverUrl,
      logoUrl: raw.logoUrl,
      isVerified: raw.isVerified,
      verifiedAt: raw.verifiedAt,
      averageRating: raw.averageRating,
      reviewCount: raw.reviewCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      experienceConfig: raw.experienceConfig ? this.toExperienceConfigDomain(raw.experienceConfig) : null,
      hours: raw.hours ? raw.hours.map((h) => this.toHourDomain(h)) : [],
      hourExceptions: raw.hourExceptions ? raw.hourExceptions.map((e) => this.toHourExceptionDomain(e)) : [],
      media: raw.media ? raw.media.map((m) => this.toMediaDomain(m)) : [],
      promotions: raw.promotions ? raw.promotions.map((p) => this.toPromotionDomain(p)) : [],
    });

    return salon;
  }

  public static toPrismaCreate(salon: SalonEntity): Prisma.SalonUncheckedCreateInput {
    return {
      id: salon.getId(),
      name: salon.getName(),
      slug: salon.getSlug().getValue(),
      phone: salon.getPhone(),
      whatsappPhone: salon.getWhatsappPhone(),
      email: salon.getEmail(),
      description: salon.getDescription(),
      universe: salon.getUniverse() as PrismaAppUniverse,
      status: salon.getStatus() as PrismaSalonStatus,
      commune: salon.getCommune(),
      quartier: salon.getQuartier(),
      landmark: salon.getLandmark(),
      latitude: salon.getCoordinates().getLatitude(),
      longitude: salon.getCoordinates().getLongitude(),
      address: salon.getAddress(),
      coverUrl: salon.getCoverUrl(),
      logoUrl: salon.getLogoUrl(),
      isVerified: salon.isVerified(),
      verifiedAt: salon.getVerifiedAt(),
      averageRating: salon.getAverageRating(),
      reviewCount: salon.getReviewCount(),
      createdAt: salon.getCreatedAt(),
      updatedAt: salon.getUpdatedAt(),
    };
  }

  public static toExperienceConfigDomain(raw: PrismaConfig): SalonExperienceConfigEntity {
    return SalonExperienceConfigEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      theme: raw.theme,
      primaryColor: raw.primaryColor,
      secondaryColor: raw.secondaryColor,
      coverMediaUrl: raw.coverMediaUrl,
      layout: raw.layout,
      bookingMode: raw.bookingMode as BookingModeType,
      enableQueue: raw.enableQueue,
      enableDeposit: raw.enableDeposit,
      enableLoyalty: raw.enableLoyalty,
      cancelFreeLimitHours: raw.cancelFreeLimitHours,
      delayAlertThresholdMin: raw.delayAlertThresholdMin,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toHourDomain(raw: PrismaHour): SalonHourEntity {
    return SalonHourEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      dayOfWeek: raw.dayOfWeek,
      openTime: raw.openTime,
      closeTime: raw.closeTime,
      isClosed: raw.isClosed,
    });
  }

  public static toHourExceptionDomain(raw: PrismaException): SalonHourExceptionEntity {
    return SalonHourExceptionEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      date: raw.date,
      openTime: raw.openTime,
      closeTime: raw.closeTime,
      isClosed: raw.isClosed,
      reason: raw.reason,
    });
  }

  public static toMediaDomain(raw: PrismaMedia): SalonMediaEntity {
    return SalonMediaEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      url: raw.url,
      mediaType: raw.mediaType,
      category: raw.category,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
    });
  }

  public static toPromotionDomain(raw: PrismaPromotion): SalonPromotionEntity {
    return SalonPromotionEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      title: raw.title,
      description: raw.description,
      discountType: raw.discountType as DiscountType,
      discountValue: raw.discountValue.toNumber(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
