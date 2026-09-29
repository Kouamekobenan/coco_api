import { Inject, Injectable } from '@nestjs/common';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { SubscriptionStatusResponseDto } from '../dtos/salon-subscription-response.dto.js';
import { SubscriptionDtoMapper } from '../dtos/subscription-dto.mapper.js';

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    userId: string | null,
    salonId: string,
  ): Promise<SubscriptionStatusResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const subscribersCount = await this.subscriptionRepo.countBySalonId(salonId);

    if (!userId) {
      return {
        isSubscribed: false,
        subscribersCount,
        subscription: null,
      };
    }

    const subscription = await this.subscriptionRepo.findByUserAndSalon(userId, salonId);

    return {
      isSubscribed: Boolean(subscription),
      subscribersCount,
      subscription: subscription ? SubscriptionDtoMapper.toResponse(subscription) : null,
    };
  }
}
