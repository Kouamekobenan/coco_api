import { Injectable } from '@nestjs/common';
import {
  AppUniverse as PrismaAppUniverse,
  SalonRole,
  SalonStatus as PrismaSalonStatus,
  BookingMode as PrismaBookingMode,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  ISalonRepository,
  NearbySalonResult,
  SalonFilterOptions,
  SalonNearbyFilterOptions,
} from '../../domain/repositories/salon.repository.interface.js';
import { SalonEntity } from '../../domain/entities/salon.entity.js';
import { SalonExperienceConfigEntity } from '../../domain/entities/salon-experience-config.entity.js';
import { SalonHourEntity } from '../../domain/entities/salon-hour.entity.js';
import { SalonHourExceptionEntity } from '../../domain/entities/salon-hour-exception.entity.js';
import { SalonMediaEntity } from '../../domain/entities/salon-media.entity.js';
import { SalonPromotionEntity } from '../../domain/entities/salon-promotion.entity.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonMapper } from './salon.mapper.js';

@Injectable()
export class PrismaSalonRepository implements ISalonRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(salon: SalonEntity, ownerUserId?: string): Promise<void> {
    const data = SalonMapper.toPrismaCreate(salon);

    await this.prisma.$transaction(async (tx) => {
      await tx.salon.create({ data });

      // Si un créateur utilisateur est fourni, on le lie directement en tant que SALON_OWNER
      if (ownerUserId) {
        await tx.salonMember.create({
          data: {
            userId: ownerUserId,
            salonId: salon.getId(),
            role: SalonRole.SALON_OWNER,
            isActive: true,
          },
        });
      }

      // Initialisation par défaut de la configuration d'expérience si inexistante
      await tx.salonExperienceConfig.create({
        data: {
          salonId: salon.getId(),
          theme: 'default',
          primaryColor: '#E05A47',
          secondaryColor: '#1A1A1A',
          layout: 'standard',
          bookingMode: PrismaBookingMode.HYBRID,
          enableQueue: true,
          enableDeposit: true,
          enableLoyalty: true,
          cancelFreeLimitHours: 4,
          delayAlertThresholdMin: 20,
        },
      });
    });
  }

  public async findById(id: string): Promise<SalonEntity | null> {
    const raw = await this.prisma.salon.findUnique({
      where: { id },
      include: {
        experienceConfig: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        hourExceptions: { orderBy: { date: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        promotions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!raw) return null;
    return SalonMapper.toDomain(raw);
  }

  public async findBySlug(slug: string): Promise<SalonEntity | null> {
    const raw = await this.prisma.salon.findUnique({
      where: { slug },
      include: {
        experienceConfig: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        hourExceptions: { orderBy: { date: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        promotions: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!raw) return null;
    return SalonMapper.toDomain(raw);
  }

  public async update(salon: SalonEntity): Promise<void> {
    await this.prisma.salon.update({
      where: { id: salon.getId() },
      data: {
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
        updatedAt: salon.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.salon.delete({
      where: { id },
    });
  }

  public async findAll(options: SalonFilterOptions): Promise<{ salons: SalonEntity[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.SalonWhereInput = {};

    if (options.universe) {
      where.universe = options.universe.toUpperCase() as PrismaAppUniverse;
    }

    if (options.status) {
      where.status = options.status as PrismaSalonStatus;
    }

    if (options.isVerified !== undefined) {
      where.isVerified = options.isVerified;
    }

    if (options.commune) {
      where.commune = { contains: options.commune.trim(), mode: 'insensitive' };
    }

    if (options.quartier) {
      where.quartier = { contains: options.quartier.trim(), mode: 'insensitive' };
    }

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { landmark: { contains: term, mode: 'insensitive' } },
        { commune: { contains: term, mode: 'insensitive' } },
        { quartier: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawSalons] = await Promise.all([
      this.prisma.salon.count({ where }),
      this.prisma.salon.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isVerified: 'desc' }, { averageRating: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    const salons = rawSalons.map((s) => SalonMapper.toDomain(s));
    return { salons, total };
  }

  public async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    options?: SalonNearbyFilterOptions,
  ): Promise<NearbySalonResult[]> {
    const userCoords = new SalonCoordinates(lat, lng);

    // Approximation de bounding box pour optimiser la requête SQL
    // 1 deg lat ~ 111 km, 1 deg lng ~ 111 * cos(lat) km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

    const where: Prisma.SalonWhereInput = {
      latitude: {
        gte: lat - latDelta,
        lte: lat + latDelta,
      },
      longitude: {
        gte: lng - lngDelta,
        lte: lng + lngDelta,
      },
    };

    if (options?.universe) {
      where.universe = options.universe as PrismaAppUniverse;
    }

    if (options?.status) {
      where.status = options.status as PrismaSalonStatus;
    }

    const rawSalons = await this.prisma.salon.findMany({
      where,
      take: 100, // Récupération d'un ensemble de candidats proches
    });

    const resultsWithDistance: NearbySalonResult[] = [];

    for (const raw of rawSalons) {
      const salonEntity = SalonMapper.toDomain(raw);
      const distance = userCoords.distanceTo(salonEntity.getCoordinates());

      if (distance <= radiusKm) {
        resultsWithDistance.push({
          salon: salonEntity,
          distanceKm: Math.round(distance * 100) / 100,
        });
      }
    }

    // Tri par distance croissante
    resultsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    const limit = options?.limit ?? 20;
    return resultsWithDistance.slice(0, limit);
  }

  public async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.SalonWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prisma.salon.count({ where });
    return count > 0;
  }

  // Expérience Vitrine
  public async findExperienceConfig(salonId: string): Promise<SalonExperienceConfigEntity | null> {
    const raw = await this.prisma.salonExperienceConfig.findUnique({
      where: { salonId },
    });
    if (!raw) return null;
    return SalonMapper.toExperienceConfigDomain(raw);
  }

  public async saveExperienceConfig(config: SalonExperienceConfigEntity): Promise<void> {
    await this.prisma.salonExperienceConfig.upsert({
      where: { salonId: config.getSalonId() },
      create: {
        id: config.getId(),
        salonId: config.getSalonId(),
        theme: config.getTheme(),
        primaryColor: config.getPrimaryColor(),
        secondaryColor: config.getSecondaryColor(),
        coverMediaUrl: config.getCoverMediaUrl(),
        layout: config.getLayout(),
        bookingMode: config.getBookingMode() as PrismaBookingMode,
        enableQueue: config.isEnableQueue(),
        enableDeposit: config.isEnableDeposit(),
        enableLoyalty: config.isEnableLoyalty(),
        cancelFreeLimitHours: config.getCancelFreeLimitHours(),
        delayAlertThresholdMin: config.getDelayAlertThresholdMin(),
      },
      update: {
        theme: config.getTheme(),
        primaryColor: config.getPrimaryColor(),
        secondaryColor: config.getSecondaryColor(),
        coverMediaUrl: config.getCoverMediaUrl(),
        layout: config.getLayout(),
        bookingMode: config.getBookingMode() as PrismaBookingMode,
        enableQueue: config.isEnableQueue(),
        enableDeposit: config.isEnableDeposit(),
        enableLoyalty: config.isEnableLoyalty(),
        cancelFreeLimitHours: config.getCancelFreeLimitHours(),
        delayAlertThresholdMin: config.getDelayAlertThresholdMin(),
      },
    });
  }

  // Horaires
  public async findHours(salonId: string): Promise<SalonHourEntity[]> {
    const raw = await this.prisma.salonHour.findMany({
      where: { salonId },
      orderBy: { dayOfWeek: 'asc' },
    });
    return raw.map((h) => SalonMapper.toHourDomain(h));
  }

  public async saveHours(salonId: string, hours: SalonHourEntity[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const h of hours) {
        await tx.salonHour.upsert({
          where: {
            salonId_dayOfWeek: {
              salonId,
              dayOfWeek: h.getDayOfWeek(),
            },
          },
          create: {
            id: h.getId(),
            salonId,
            dayOfWeek: h.getDayOfWeek(),
            openTime: h.getOpenTime(),
            closeTime: h.getCloseTime(),
            isClosed: h.isClosed(),
          },
          update: {
            openTime: h.getOpenTime(),
            closeTime: h.getCloseTime(),
            isClosed: h.isClosed(),
          },
        });
      }
    });
  }

  public async findHourExceptions(salonId: string): Promise<SalonHourExceptionEntity[]> {
    const raw = await this.prisma.salonHourException.findMany({
      where: { salonId },
      orderBy: { date: 'asc' },
    });
    return raw.map((e) => SalonMapper.toHourExceptionDomain(e));
  }

  public async findHourExceptionById(exceptionId: string): Promise<SalonHourExceptionEntity | null> {
    const raw = await this.prisma.salonHourException.findUnique({
      where: { id: exceptionId },
    });
    if (!raw) return null;
    return SalonMapper.toHourExceptionDomain(raw);
  }

  public async saveHourException(exception: SalonHourExceptionEntity): Promise<void> {
    await this.prisma.salonHourException.upsert({
      where: {
        salonId_date: {
          salonId: exception.getSalonId(),
          date: exception.getDate(),
        },
      },
      create: {
        id: exception.getId(),
        salonId: exception.getSalonId(),
        date: exception.getDate(),
        openTime: exception.getOpenTime(),
        closeTime: exception.getCloseTime(),
        isClosed: exception.isClosed(),
        reason: exception.getReason(),
      },
      update: {
        openTime: exception.getOpenTime(),
        closeTime: exception.getCloseTime(),
        isClosed: exception.isClosed(),
        reason: exception.getReason(),
      },
    });
  }

  public async deleteHourException(exceptionId: string): Promise<void> {
    await this.prisma.salonHourException.delete({
      where: { id: exceptionId },
    });
  }

  // Médias
  public async findMedia(salonId: string): Promise<SalonMediaEntity[]> {
    const raw = await this.prisma.salonMedia.findMany({
      where: { salonId },
      orderBy: { sortOrder: 'asc' },
    });
    return raw.map((m) => SalonMapper.toMediaDomain(m));
  }

  public async findMediaById(mediaId: string): Promise<SalonMediaEntity | null> {
    const raw = await this.prisma.salonMedia.findUnique({
      where: { id: mediaId },
    });
    if (!raw) return null;
    return SalonMapper.toMediaDomain(raw);
  }

  public async saveMedia(media: SalonMediaEntity): Promise<void> {
    await this.prisma.salonMedia.create({
      data: {
        id: media.getId(),
        salonId: media.getSalonId(),
        url: media.getUrl(),
        mediaType: media.getMediaType(),
        category: media.getCategory(),
        sortOrder: media.getSortOrder(),
      },
    });
  }

  public async deleteMedia(mediaId: string): Promise<void> {
    await this.prisma.salonMedia.delete({
      where: { id: mediaId },
    });
  }

  public async updateMediaSortOrder(
    salonId: string,
    orders: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map((item) =>
        this.prisma.salonMedia.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }

  // Promotions
  public async findPromotions(salonId: string, onlyActive = false): Promise<SalonPromotionEntity[]> {
    const where: Prisma.SalonPromotionWhereInput = { salonId };
    if (onlyActive) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }

    const raw = await this.prisma.salonPromotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return raw.map((p) => SalonMapper.toPromotionDomain(p));
  }

  public async findPromotionById(promotionId: string): Promise<SalonPromotionEntity | null> {
    const raw = await this.prisma.salonPromotion.findUnique({
      where: { id: promotionId },
    });
    if (!raw) return null;
    return SalonMapper.toPromotionDomain(raw);
  }

  public async savePromotion(promotion: SalonPromotionEntity): Promise<void> {
    await this.prisma.salonPromotion.create({
      data: {
        id: promotion.getId(),
        salonId: promotion.getSalonId(),
        title: promotion.getTitle(),
        description: promotion.getDescription(),
        discountType: promotion.getDiscountType(),
        discountValue: new Prisma.Decimal(promotion.getDiscountValue()),
        startDate: promotion.getStartDate(),
        endDate: promotion.getEndDate(),
        isActive: promotion.isActive(),
      },
    });
  }

  public async updatePromotion(promotion: SalonPromotionEntity): Promise<void> {
    await this.prisma.salonPromotion.update({
      where: { id: promotion.getId() },
      data: {
        title: promotion.getTitle(),
        description: promotion.getDescription(),
        discountType: promotion.getDiscountType(),
        discountValue: new Prisma.Decimal(promotion.getDiscountValue()),
        startDate: promotion.getStartDate(),
        endDate: promotion.getEndDate(),
        isActive: promotion.isActive(),
      },
    });
  }

  public async deletePromotion(promotionId: string): Promise<void> {
    await this.prisma.salonPromotion.delete({
      where: { id: promotionId },
    });
  }
}
