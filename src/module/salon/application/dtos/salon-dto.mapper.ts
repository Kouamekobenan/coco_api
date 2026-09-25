import { SalonEntity } from '../../domain/entities/salon.entity.js';
import { SalonResponseDto } from './salon-response.dto.js';
import { SalonExperienceConfigEntity } from '../../domain/entities/salon-experience-config.entity.js';
import { SalonExperienceConfigResponseDto } from './salon-experience-config.dto.js';
import { SalonHourEntity } from '../../domain/entities/salon-hour.entity.js';
import { SalonHourResponseDto, SalonHourExceptionResponseDto } from './salon-hours.dto.js';
import { SalonHourExceptionEntity } from '../../domain/entities/salon-hour-exception.entity.js';
import { SalonMediaEntity } from '../../domain/entities/salon-media.entity.js';
import { SalonMediaResponseDto } from './salon-media.dto.js';
import { SalonPromotionEntity } from '../../domain/entities/salon-promotion.entity.js';
import { SalonPromotionResponseDto } from './salon-promotion.dto.js';

export class SalonDtoMapper {
  public static toResponse(entity: SalonEntity): SalonResponseDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      slug: entity.getSlug().getValue(),
      phone: entity.getPhone(),
      whatsappPhone: entity.getWhatsappPhone(),
      email: entity.getEmail(),
      description: entity.getDescription(),
      universe: entity.getUniverse(),
      status: entity.getStatus(),
      commune: entity.getCommune(),
      quartier: entity.getQuartier(),
      landmark: entity.getLandmark(),
      coordinates: {
        latitude: entity.getCoordinates().getLatitude(),
        longitude: entity.getCoordinates().getLongitude(),
      },
      address: entity.getAddress(),
      coverUrl: entity.getCoverUrl(),
      logoUrl: entity.getLogoUrl(),
      isVerified: entity.isVerified(),
      verifiedAt: entity.getVerifiedAt(),
      averageRating: entity.getAverageRating(),
      reviewCount: entity.getReviewCount(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  public static toExperienceConfigResponse(entity: SalonExperienceConfigEntity): SalonExperienceConfigResponseDto {
    return {
      id: entity.getId(),
      salonId: entity.getSalonId(),
      theme: entity.getTheme(),
      primaryColor: entity.getPrimaryColor(),
      secondaryColor: entity.getSecondaryColor(),
      coverMediaUrl: entity.getCoverMediaUrl(),
      layout: entity.getLayout(),
      bookingMode: entity.getBookingMode(),
      enableQueue: entity.isEnableQueue(),
      enableDeposit: entity.isEnableDeposit(),
      enableLoyalty: entity.isEnableLoyalty(),
      cancelFreeLimitHours: entity.getCancelFreeLimitHours(),
      delayAlertThresholdMin: entity.getDelayAlertThresholdMin(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  public static toHourResponse(entity: SalonHourEntity): SalonHourResponseDto {
    return {
      id: entity.getId(),
      dayOfWeek: entity.getDayOfWeek(),
      openTime: entity.getOpenTime(),
      closeTime: entity.getCloseTime(),
      isClosed: entity.isClosed(),
    };
  }

  public static toHourExceptionResponse(entity: SalonHourExceptionEntity): SalonHourExceptionResponseDto {
    return {
      id: entity.getId(),
      date: entity.getDate().toISOString().split('T')[0],
      openTime: entity.getOpenTime(),
      closeTime: entity.getCloseTime(),
      isClosed: entity.isClosed(),
      reason: entity.getReason(),
    };
  }

  public static toMediaResponse(entity: SalonMediaEntity): SalonMediaResponseDto {
    return {
      id: entity.getId(),
      salonId: entity.getSalonId(),
      url: entity.getUrl(),
      mediaType: entity.getMediaType(),
      category: entity.getCategory(),
      sortOrder: entity.getSortOrder(),
      createdAt: entity.getCreatedAt(),
    };
  }

  public static toPromotionResponse(entity: SalonPromotionEntity): SalonPromotionResponseDto {
    return {
      id: entity.getId(),
      salonId: entity.getSalonId(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      discountType: entity.getDiscountType(),
      discountValue: entity.getDiscountValue(),
      startDate: entity.getStartDate(),
      endDate: entity.getEndDate(),
      isActive: entity.isActive(),
      isValidNow: entity.isCurrentlyValid(),
      createdAt: entity.getCreatedAt(),
    };
  }
}
