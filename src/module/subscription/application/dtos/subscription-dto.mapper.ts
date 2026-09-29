import { SalonSubscriptionEntity } from '../../domain/entities/salon-subscription.entity.js';
import {
  SalonSubscriptionResponseDto,
  SubscribedSalonSummaryDto,
  SubscriberUserSummaryDto,
} from './salon-subscription-response.dto.js';

export class SubscriptionDtoMapper {
  public static toResponse(entity: SalonSubscriptionEntity): SalonSubscriptionResponseDto {
    const response = new SalonSubscriptionResponseDto();
    response.id = entity.getId();
    response.userId = entity.getUserId();
    response.salonId = entity.getSalonId();
    response.notifyPromos = entity.isNotifyPromos();
    response.notifyStories = entity.isNotifyStories();
    response.createdAt = entity.getCreatedAt();
    response.updatedAt = entity.getUpdatedAt();

    const salonDetails = entity.getSalonDetails();
    if (salonDetails) {
      const salon = new SubscribedSalonSummaryDto();
      salon.id = entity.getSalonId();
      salon.name = salonDetails.name;
      salon.slug = salonDetails.slug;
      salon.logoUrl = salonDetails.logoUrl ?? null;
      salon.coverUrl = salonDetails.coverUrl ?? null;
      salon.commune = salonDetails.commune;
      salon.quartier = salonDetails.quartier;
      salon.averageRating = salonDetails.averageRating;
      salon.reviewCount = salonDetails.reviewCount;
      response.salon = salon;
    }

    const userDetails = entity.getUserDetails();
    if (userDetails) {
      const user = new SubscriberUserSummaryDto();
      user.id = entity.getUserId();
      user.firstName = userDetails.firstName ?? null;
      user.lastName = userDetails.lastName ?? null;
      user.phone = userDetails.phone;
      user.avatarUrl = userDetails.avatarUrl ?? null;
      response.user = user;
    }

    return response;
  }
}
