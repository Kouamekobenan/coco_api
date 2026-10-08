import { PlanTier } from '@prisma/client';

export interface SalonPlanProps {
  id: string;
  tier: PlanTier;
  name: string;
  priceMonth: number;
  priceYear?: number | null;
  maxStaff?: number | null;
  maxServices?: number | null;
  enableQueue: boolean;
  features?: Record<string, any> | null;
  isActive: boolean;
  createdAt: Date;
}

export class SalonPlanEntity {
  constructor(private readonly props: SalonPlanProps) {}

  public getId(): string {
    return this.props.id;
  }

  public getTier(): PlanTier {
    return this.props.tier;
  }

  public getName(): string {
    return this.props.name;
  }

  public getPriceMonth(): number {
    return this.props.priceMonth;
  }

  public getPriceYear(): number | null {
    return this.props.priceYear ?? null;
  }

  public getMaxStaff(): number | null {
    return this.props.maxStaff ?? null;
  }

  public getMaxServices(): number | null {
    return this.props.maxServices ?? null;
  }

  public isQueueEnabled(): boolean {
    return this.props.enableQueue;
  }

  public getFeatures(): Record<string, any> | null {
    return this.props.features ?? null;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }
}
