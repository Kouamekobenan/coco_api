import { StyleEntity } from '../../domain/entities/style.entity.js';
import { StyleResponseDto } from './style-response.dto.js';
import { ServiceVariantEntity } from '../../domain/entities/service-variant.entity.js';
import { ServiceVariantResponseDto } from './service-variant-response.dto.js';
import { ServiceEntity } from '../../domain/entities/service.entity.js';
import { ServiceResponseDto } from './service-response.dto.js';

export class ServiceDtoMapper {
  public static toStyleResponse(style: StyleEntity): StyleResponseDto {
    return {
      id: style.getId(),
      name: style.getName(),
      slug: style.getSlug(),
      universe: style.getUniverse(),
      description: style.getDescription(),
      imageUrl: style.getImageUrl(),
      isActive: style.isActive(),
      createdAt: style.getCreatedAt(),
    };
  }

  public static toVariantResponse(variant: ServiceVariantEntity): ServiceVariantResponseDto {
    return {
      id: variant.getId(),
      serviceId: variant.getServiceId(),
      name: variant.getName(),
      durationMin: variant.getDurations().getMin(),
      durationEstimated: variant.getDurations().getEstimated(),
      durationMax: variant.getDurations().getMax(),
      setupMinutes: variant.getDurations().getSetup(),
      bufferMinutes: variant.getDurations().getBuffer(),
      totalProjectedMinutes: variant.getDurations().getTotalProjectedMinutes(),
      priceFrom: variant.getPrice().getFrom(),
      priceTo: variant.getPrice().getTo(),
      requiresConsultation: variant.isRequiresConsultation(),
      requiresDeposit: variant.isRequiresDeposit(),
      depositRule: variant.getDepositRule(),
      depositAmount: variant.getDepositAmount(),
      requiresOwnMaterials: variant.isRequiresOwnMaterials(),
      isLongService: variant.isLongService(),
      requiredResourceType: variant.getRequiredResourceType(),
      isActive: variant.isActive(),
      createdAt: variant.getCreatedAt(),
    };
  }

  public static toServiceResponse(service: ServiceEntity): ServiceResponseDto {
    return {
      id: service.getId(),
      salonId: service.getSalonId(),
      styleId: service.getStyleId(),
      name: service.getName(),
      description: service.getDescription(),
      universe: service.getUniverse(),
      isActive: service.isActive(),
      sortOrder: service.getSortOrder(),
      style: service.getStyle() ? this.toStyleResponse(service.getStyle()!) : null,
      variants: service.getVariants().map((v) => this.toVariantResponse(v)),
      createdAt: service.getCreatedAt(),
      updatedAt: service.getUpdatedAt(),
    };
  }
}
