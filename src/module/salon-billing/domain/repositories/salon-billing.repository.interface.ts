import { PlanTier, BillingPeriod, PaymentProvider, PaymentStatus } from '@prisma/client';
import { SalonPlanEntity } from '../entities/salon-plan.entity.js';
import { SalonBillingSubscriptionEntity } from '../entities/salon-billing-subscription.entity.js';

export const SALON_BILLING_REPOSITORY = Symbol('ISalonBillingRepository');

export interface RecordSubscriptionPaymentInput {
  subscriptionId: string;
  salonId: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerTxId?: string | null;
  billingPeriod: BillingPeriod;
  paidAt?: Date | null;
}

export interface ISalonBillingRepository {
  findPlanByTier(tier: PlanTier): Promise<SalonPlanEntity | null>;
  findPlanById(id: string): Promise<SalonPlanEntity | null>;
  findAllActivePlans(): Promise<SalonPlanEntity[]>;

  findSubscriptionBySalonId(salonId: string): Promise<SalonBillingSubscriptionEntity | null>;
  saveSubscription(subscription: SalonBillingSubscriptionEntity): Promise<SalonBillingSubscriptionEntity>;
  updateSubscription(subscription: SalonBillingSubscriptionEntity): Promise<SalonBillingSubscriptionEntity>;

  recordPayment(input: RecordSubscriptionPaymentInput): Promise<void>;
  findExpiredActiveSubscriptions(now: Date): Promise<SalonBillingSubscriptionEntity[]>;
}
