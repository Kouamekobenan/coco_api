import { Inject, Injectable } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SalonPlanNotFoundException } from '../../domain/exceptions/salon-billing.exception.js';
import { SalonPlanResponseDto } from '../dtos/salon-plan-response.dto.js';
import { UpdatePlanPriceDto } from '../dtos/update-plan-price.dto.js';

@Injectable()
export class UpdateSalonPlanPriceUseCase {
  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
  ) {}

  public async execute(
    tier: PlanTier,
    dto: UpdatePlanPriceDto,
  ): Promise<SalonPlanResponseDto> {
    const existing = await this.billingRepo.findPlanByTier(tier);
    if (!existing) {
      throw new SalonPlanNotFoundException(tier);
    }
    const p = await this.billingRepo.updatePlanPrice(
      tier,
      dto.priceMonth,
      dto.priceYear,
    );
    return {
      id: p.getId(),
      tier: p.getTier(),
      name: p.getName(),
      priceMonth: p.getPriceMonth(),
      priceYear: p.getPriceYear(),
      maxStaff: p.getMaxStaff(),
      maxServices: p.getMaxServices(),
      enableQueue: p.isQueueEnabled(),
      features: p.getFeatures(),
    };
  }
}
