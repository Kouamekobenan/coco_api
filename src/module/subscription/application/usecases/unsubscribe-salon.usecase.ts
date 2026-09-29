import { Inject, Injectable } from '@nestjs/common';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SubscriptionNotFoundException } from '../../domain/exceptions/subscription-domain.exception.js';

@Injectable()
export class UnsubscribeSalonUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
  ) {}

  public async execute(
    userId: string,
    salonId: string,
  ): Promise<{ success: boolean; message: string }> {
    const existing = await this.subscriptionRepo.findByUserAndSalon(userId, salonId);
    if (!existing) {
      throw new SubscriptionNotFoundException(salonId);
    }

    await this.subscriptionRepo.delete(userId, salonId);

    return {
      success: true,
      message: 'Désabonnement du salon effectué avec succès.',
    };
  }
}
