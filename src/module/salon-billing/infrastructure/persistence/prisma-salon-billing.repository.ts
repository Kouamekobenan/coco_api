import { Injectable } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  ISalonBillingRepository,
  RecordSubscriptionPaymentInput,
} from '../../domain/repositories/salon-billing.repository.interface.js';
import { SalonPlanEntity } from '../../domain/entities/salon-plan.entity.js';
import { SalonBillingSubscriptionEntity } from '../../domain/entities/salon-billing-subscription.entity.js';
import { SalonBillingMapper } from './salon-billing.mapper.js';

@Injectable()
export class PrismaSalonBillingRepository implements ISalonBillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findPlanByTier(tier: PlanTier): Promise<SalonPlanEntity | null> {
    const raw = await this.prisma.salonPlan.findUnique({
      where: { tier },
    });
    return raw ? SalonBillingMapper.toPlanDomain(raw) : null;
  }

  public async findPlanById(id: string): Promise<SalonPlanEntity | null> {
    const raw = await this.prisma.salonPlan.findUnique({
      where: { id },
    });
    return raw ? SalonBillingMapper.toPlanDomain(raw) : null;
  }

  public async findAllActivePlans(): Promise<SalonPlanEntity[]> {
    const list = await this.prisma.salonPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonth: 'asc' },
    });
    return list.map((item) => SalonBillingMapper.toPlanDomain(item));
  }

  public async findSubscriptionBySalonId(
    salonId: string,
  ): Promise<SalonBillingSubscriptionEntity | null> {
    const raw = await this.prisma.salonBillingSubscription.findUnique({
      where: { salonId },
      include: { plan: true },
    });
    return raw ? SalonBillingMapper.toSubscriptionDomain(raw) : null;
  }

  public async saveSubscription(
    subscription: SalonBillingSubscriptionEntity,
  ): Promise<SalonBillingSubscriptionEntity> {
    const raw = await this.prisma.salonBillingSubscription.create({
      data: {
        id: subscription.getId(),
        salonId: subscription.getSalonId(),
        planId: subscription.getPlanId(),
        status: subscription.getStatus(),
        startDate: subscription.getStartDate(),
        endDate: subscription.getEndDate(),
        trialEndsAt: subscription.getTrialEndsAt(),
        autoRenew: subscription.isAutoRenew(),
      },
      include: { plan: true },
    });
    return SalonBillingMapper.toSubscriptionDomain(raw);
  }

  public async updateSubscription(
    subscription: SalonBillingSubscriptionEntity,
  ): Promise<SalonBillingSubscriptionEntity> {
    const raw = await this.prisma.salonBillingSubscription.update({
      where: { id: subscription.getId() },
      data: {
        planId: subscription.getPlanId(),
        status: subscription.getStatus(),
        endDate: subscription.getEndDate(),
        autoRenew: subscription.isAutoRenew(),
      },
      include: { plan: true },
    });
    return SalonBillingMapper.toSubscriptionDomain(raw);
  }

  public async recordPayment(input: RecordSubscriptionPaymentInput): Promise<void> {
    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: input.subscriptionId,
        salonId: input.salonId,
        amount: input.amount,
        currency: input.currency ?? 'XOF',
        provider: input.provider,
        status: input.status,
        providerTxId: input.providerTxId ?? null,
        billingPeriod: input.billingPeriod,
        paidAt: input.paidAt ?? new Date(),
      },
    });
  }

  public async findExpiredActiveSubscriptions(
    now: Date,
  ): Promise<SalonBillingSubscriptionEntity[]> {
    const list = await this.prisma.salonBillingSubscription.findMany({
      where: {
        endDate: { lt: now },
        status: { in: ['TRIALING', 'ACTIVE'] },
      },
      include: { plan: true },
    });
    return list.map((item) => SalonBillingMapper.toSubscriptionDomain(item));
  }
}
