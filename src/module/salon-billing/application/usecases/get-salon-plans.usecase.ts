import { Inject, Injectable } from '@nestjs/common';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SalonPlanResponseDto } from '../dtos/salon-plan-response.dto.js';

@Injectable()
export class GetSalonPlansUseCase {
  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
  ) {}

  public async execute(): Promise<SalonPlanResponseDto[]> {
    const plans = await this.billingRepo.findAllActivePlans();
    return plans.map((p) => ({
      id: p.getId(),
      tier: p.getTier(),
      name: p.getName(),
      priceMonth: p.getPriceMonth(),
      priceYear: p.getPriceYear(),
      maxStaff: p.getMaxStaff(),
      maxServices: p.getMaxServices(),
      enableQueue: p.isQueueEnabled(),
      features: p.getFeatures(),
    }));
  }
}
