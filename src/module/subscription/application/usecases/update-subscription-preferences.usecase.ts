import { Inject, Injectable } from '@nestjs/common';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SubscriptionNotFoundException } from '../../domain/exceptions/subscription-domain.exception.js';
import { UpdateSubscriptionPreferencesDto } from '../dtos/update-subscription-preferences.dto.js';
import { SalonSubscriptionResponseDto } from '../dtos/salon-subscription-response.dto.js';
import { SubscriptionDtoMapper } from '../dtos/subscription-dto.mapper.js';

@Injectable()
export class UpdateSubscriptionPreferencesUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
  ) {}

  public async execute(
    userId: string,
    salonId: string,
    dto: UpdateSubscriptionPreferencesDto,
  ): Promise<SalonSubscriptionResponseDto> {
    const subscription = await this.subscriptionRepo.findByUserAndSalon(userId, salonId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(salonId);
    }

    subscription.updatePreferences(dto.notifyPromos, dto.notifyStories);
    const updated = await this.subscriptionRepo.update(subscription);

    return SubscriptionDtoMapper.toResponse(updated);
  }
}
