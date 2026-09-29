import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { SalonSubscriptionEntity } from '../../domain/entities/salon-subscription.entity.js';
import { SubscribeSalonDto } from '../dtos/subscribe-salon.dto.js';
import { SalonSubscriptionResponseDto } from '../dtos/salon-subscription-response.dto.js';
import { SubscriptionDtoMapper } from '../dtos/subscription-dto.mapper.js';

@Injectable()
export class SubscribeSalonUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    userId: string,
    salonId: string,
    dto?: SubscribeSalonDto,
  ): Promise<SalonSubscriptionResponseDto> {
    // 1. Vérifier que le salon existe
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    // 2. Vérifier si l'utilisateur est déjà abonné (idempotence)
    const existing = await this.subscriptionRepo.findByUserAndSalon(userId, salonId);
    if (existing) {
      // Si déjà abonné et que de nouvelles préférences sont fournies, on met à jour
      if (dto?.notifyPromos !== undefined || dto?.notifyStories !== undefined) {
        existing.updatePreferences(dto.notifyPromos, dto.notifyStories);
        const updated = await this.subscriptionRepo.update(existing);
        return SubscriptionDtoMapper.toResponse(updated);
      }
      return SubscriptionDtoMapper.toResponse(existing);
    }

    // 3. Création du nouvel abonnement
    const subscription = SalonSubscriptionEntity.create({
      id: randomUUID(),
      userId,
      salonId,
      notifyPromos: dto?.notifyPromos ?? true,
      notifyStories: dto?.notifyStories ?? true,
    });

    const saved = await this.subscriptionRepo.save(subscription);
    return SubscriptionDtoMapper.toResponse(saved);
  }
}
