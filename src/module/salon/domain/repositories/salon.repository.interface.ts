import { SalonEntity, AppUniverseType, SalonStatusType } from '../entities/salon.entity.js';
import { SalonExperienceConfigEntity } from '../entities/salon-experience-config.entity.js';
import { SalonHourEntity } from '../entities/salon-hour.entity.js';
import { SalonHourExceptionEntity } from '../entities/salon-hour-exception.entity.js';
import { SalonMediaEntity } from '../entities/salon-media.entity.js';
import { SalonPromotionEntity } from '../entities/salon-promotion.entity.js';

export const SALON_REPOSITORY = Symbol('SALON_REPOSITORY');

export interface SalonFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  universe?: AppUniverseType;
  commune?: string;
  quartier?: string;
  status?: SalonStatusType;
  isVerified?: boolean;
}

export interface SalonNearbyFilterOptions {
  universe?: AppUniverseType;
  status?: SalonStatusType;
  limit?: number;
}

export interface NearbySalonResult {
  salon: SalonEntity;
  distanceKm: number;
}

export interface ISalonRepository {
  // Aggregate Root Salon
  save(salon: SalonEntity, ownerUserId?: string): Promise<void>;
  findById(id: string): Promise<SalonEntity | null>;
  findBySlug(slug: string): Promise<SalonEntity | null>;
  update(salon: SalonEntity): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(options: SalonFilterOptions): Promise<{ salons: SalonEntity[]; total: number }>;
  findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    options?: SalonNearbyFilterOptions,
  ): Promise<NearbySalonResult[]>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;

  // Expérience Vitrine
  findExperienceConfig(salonId: string): Promise<SalonExperienceConfigEntity | null>;
  saveExperienceConfig(config: SalonExperienceConfigEntity): Promise<void>;

  // Horaires
  findHours(salonId: string): Promise<SalonHourEntity[]>;
  saveHours(salonId: string, hours: SalonHourEntity[]): Promise<void>;
  findHourExceptions(salonId: string): Promise<SalonHourExceptionEntity[]>;
  findHourExceptionById(exceptionId: string): Promise<SalonHourExceptionEntity | null>;
  saveHourException(exception: SalonHourExceptionEntity): Promise<void>;
  deleteHourException(exceptionId: string): Promise<void>;

  // Médias
  findMedia(salonId: string): Promise<SalonMediaEntity[]>;
  findMediaById(mediaId: string): Promise<SalonMediaEntity | null>;
  saveMedia(media: SalonMediaEntity): Promise<void>;
  deleteMedia(mediaId: string): Promise<void>;
  updateMediaSortOrder(salonId: string, orders: Array<{ id: string; sortOrder: number }>): Promise<void>;

  // Promotions
  findPromotions(salonId: string, onlyActive?: boolean): Promise<SalonPromotionEntity[]>;
  findPromotionById(promotionId: string): Promise<SalonPromotionEntity | null>;
  savePromotion(promotion: SalonPromotionEntity): Promise<void>;
  updatePromotion(promotion: SalonPromotionEntity): Promise<void>;
  deletePromotion(promotionId: string): Promise<void>;
}
