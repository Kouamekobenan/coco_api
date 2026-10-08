import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SalonBillingSubscriptionEntity } from '../../domain/entities/salon-billing-subscription.entity.js';
import { SalonBillingStatusResponseDto } from '../dtos/salon-billing-status-response.dto.js';
import { SalonPlanNotFoundException } from '../../domain/exceptions/salon-billing.exception.js';

@Injectable()
export class GetSalonBillingStatusUseCase {
  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
    private readonly prisma: PrismaService,
  ) {}

  public async execute(salonId: string): Promise<SalonBillingStatusResponseDto> {
    let subscription = await this.billingRepo.findSubscriptionBySalonId(salonId);

    // Si le salon n'a pas encore d'abonnement (anciens salons créés avant la migration),
    // on lui attribue automatiquement le pack FREE pour 30 jours
    if (!subscription) {
      const freePlan = await this.billingRepo.findPlanByTier('FREE');
      if (!freePlan) {
        throw new SalonPlanNotFoundException('FREE');
      }

      subscription = SalonBillingSubscriptionEntity.createFreeTrial({
        id: randomUUID(),
        salonId,
        planId: freePlan.getId(),
        plan: freePlan,
      });

      subscription = await this.billingRepo.saveSubscription(subscription);
    }

    const plan = subscription.getPlan();
    if (!plan) {
      throw new SalonPlanNotFoundException(subscription.getPlanId());
    }

    const currentStaffCount = await this.prisma.staff.count({
      where: { salonId, isActive: true },
    });

    const currentServicesCount = await this.prisma.service.count({
      where: { salonId, isActive: true },
    });

    const now = Date.now();
    const endMs = subscription.getEndDate().getTime();
    const remainingDays = Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24)));

    const maxStaff = plan.getMaxStaff();
    const maxServices = plan.getMaxServices();

    return {
      id: subscription.getId(),
      salonId: subscription.getSalonId(),
      status: subscription.getStatus(),
      isValid: subscription.isValid(),
      remainingDays,
      startDate: subscription.getStartDate(),
      endDate: subscription.getEndDate(),
      trialEndsAt: subscription.getTrialEndsAt(),
      plan: {
        id: plan.getId(),
        tier: plan.getTier(),
        name: plan.getName(),
        priceMonth: plan.getPriceMonth(),
        priceYear: plan.getPriceYear(),
        maxStaff: plan.getMaxStaff(),
        maxServices: plan.getMaxServices(),
        enableQueue: plan.isQueueEnabled(),
        features: plan.getFeatures(),
      },
      staffQuota: {
        current: currentStaffCount,
        max: maxStaff,
        isLimitReached: maxStaff !== null ? currentStaffCount >= maxStaff : false,
      },
      servicesQuota: {
        current: currentServicesCount,
        max: maxServices,
        isLimitReached: maxServices !== null ? currentServicesCount >= maxServices : false,
      },
    };
  }
}
