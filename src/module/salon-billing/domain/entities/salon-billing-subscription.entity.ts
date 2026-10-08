import { SalonSubscriptionStatus } from '@prisma/client';
import { SalonPlanEntity } from './salon-plan.entity.js';

export interface SalonBillingSubscriptionProps {
  id: string;
  salonId: string;
  planId: string;
  status: SalonSubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date | null;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan?: SalonPlanEntity | null;
}

export class SalonBillingSubscriptionEntity {
  private constructor(private readonly props: SalonBillingSubscriptionProps) {}

  public static createFreeTrial(props: {
    id: string;
    salonId: string;
    planId: string;
    plan?: SalonPlanEntity | null;
  }): SalonBillingSubscriptionEntity {
    const now = new Date();
    // 30 jours de validité offerts pour le pack Free
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return new SalonBillingSubscriptionEntity({
      id: props.id,
      salonId: props.salonId,
      planId: props.planId,
      status: 'TRIALING',
      startDate: now,
      endDate,
      trialEndsAt: endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
      plan: props.plan ?? null,
    });
  }

  public static reconstitute(props: SalonBillingSubscriptionProps): SalonBillingSubscriptionEntity {
    return new SalonBillingSubscriptionEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getPlanId(): string {
    return this.props.planId;
  }

  public getStatus(): SalonSubscriptionStatus {
    return this.props.status;
  }

  public getStartDate(): Date {
    return this.props.startDate;
  }

  public getEndDate(): Date {
    return this.props.endDate;
  }

  public getTrialEndsAt(): Date | null {
    return this.props.trialEndsAt ?? null;
  }

  public isAutoRenew(): boolean {
    return this.props.autoRenew;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getPlan(): SalonPlanEntity | null {
    return this.props.plan ?? null;
  }

  public isValid(): boolean {
    const now = new Date();
    return (
      (this.props.status === 'TRIALING' || this.props.status === 'ACTIVE') &&
      this.props.endDate.getTime() > now.getTime()
    );
  }

  public isExpired(): boolean {
    return !this.isValid();
  }

  public markExpired(): void {
    this.props.status = 'EXPIRED';
    this.props.updatedAt = new Date();
  }

  public upgradeOrRenew(newPlanId: string, additionalDays: number = 30): void {
    const now = new Date();
    const baseDate = this.props.endDate.getTime() > now.getTime() ? this.props.endDate : now;
    const newEndDate = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    this.props.planId = newPlanId;
    this.props.status = 'ACTIVE';
    this.props.endDate = newEndDate;
    this.props.updatedAt = new Date();
  }
}
