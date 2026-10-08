import {
  SalonPlan as PrismaSalonPlan,
  SalonBillingSubscription as PrismaSalonBillingSubscription,
} from '@prisma/client';
import { SalonPlanEntity } from '../../domain/entities/salon-plan.entity.js';
import { SalonBillingSubscriptionEntity } from '../../domain/entities/salon-billing-subscription.entity.js';

export type PrismaSubscriptionWithPlan = PrismaSalonBillingSubscription & {
  plan?: PrismaSalonPlan | null;
};

export class SalonBillingMapper {
  public static toPlanDomain(raw: PrismaSalonPlan): SalonPlanEntity {
    return new SalonPlanEntity({
      id: raw.id,
      tier: raw.tier,
      name: raw.name,
      priceMonth: raw.priceMonth,
      priceYear: raw.priceYear,
      maxStaff: raw.maxStaff,
      maxServices: raw.maxServices,
      enableQueue: raw.enableQueue,
      features: raw.features as Record<string, any> | null,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
    });
  }

  public static toSubscriptionDomain(raw: PrismaSubscriptionWithPlan): SalonBillingSubscriptionEntity {
    return SalonBillingSubscriptionEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      planId: raw.planId,
      status: raw.status,
      startDate: raw.startDate,
      endDate: raw.endDate,
      trialEndsAt: raw.trialEndsAt,
      autoRenew: raw.autoRenew,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      plan: raw.plan ? this.toPlanDomain(raw.plan) : null,
    });
  }
}
