import { ServiceDurations } from '../value-objects/service-durations.vo.js';
import { ServicePrice } from '../value-objects/service-price.vo.js';

export type DepositRuleType = 'FIXED_AMOUNT' | 'PERCENTAGE';
export type ResourceType = 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL';

export interface ServiceVariantProps {
  id: string;
  serviceId: string;
  name: string;
  durations: ServiceDurations;
  price: ServicePrice;

  requiresConsultation: boolean;
  requiresDeposit: boolean;
  depositRule: DepositRuleType;
  depositAmount: number;
  requiresOwnMaterials: boolean;
  isLongService: boolean;

  requiredResourceType?: ResourceType | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceVariantEntity {
  private constructor(private readonly props: ServiceVariantProps) {}

  public static create(props: {
    id: string;
    serviceId: string;
    name: string;
    durations: ServiceDurations;
    price: ServicePrice;
    requiresConsultation?: boolean;
    requiresDeposit?: boolean;
    depositRule?: DepositRuleType;
    depositAmount?: number;
    requiresOwnMaterials?: boolean;
    requiredResourceType?: ResourceType | null;
  }): ServiceVariantEntity {
    const now = new Date();
    const isLongService = props.durations.isLongService();

    return new ServiceVariantEntity({
      id: props.id,
      serviceId: props.serviceId,
      name: props.name.trim(),
      durations: props.durations,
      price: props.price,
      requiresConsultation: props.requiresConsultation ?? false,
      requiresDeposit: props.requiresDeposit ?? true,
      depositRule: props.depositRule ?? 'FIXED_AMOUNT',
      depositAmount: props.depositAmount ?? 2000,
      requiresOwnMaterials: props.requiresOwnMaterials ?? false,
      isLongService,
      requiredResourceType: props.requiredResourceType ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ServiceVariantProps): ServiceVariantEntity {
    return new ServiceVariantEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getServiceId(): string {
    return this.props.serviceId;
  }

  public getName(): string {
    return this.props.name;
  }

  public getDurations(): ServiceDurations {
    return this.props.durations;
  }

  public getPrice(): ServicePrice {
    return this.props.price;
  }

  public isRequiresConsultation(): boolean {
    return this.props.requiresConsultation;
  }

  public isRequiresDeposit(): boolean {
    return this.props.requiresDeposit;
  }

  public getDepositRule(): DepositRuleType {
    return this.props.depositRule;
  }

  public getDepositAmount(): number {
    return this.props.depositAmount;
  }

  public isRequiresOwnMaterials(): boolean {
    return this.props.requiresOwnMaterials;
  }

  public isLongService(): boolean {
    return this.props.isLongService;
  }

  public getRequiredResourceType(): ResourceType | null {
    return this.props.requiredResourceType ?? null;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: {
    name?: string;
    durations?: ServiceDurations;
    price?: ServicePrice;
    requiresConsultation?: boolean;
    requiresDeposit?: boolean;
    depositRule?: DepositRuleType;
    depositAmount?: number;
    requiresOwnMaterials?: boolean;
    requiredResourceType?: ResourceType | null;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) this.props.name = props.name.trim();
    if (props.durations !== undefined) {
      this.props.durations = props.durations;
      this.props.isLongService = props.durations.isLongService();
    }
    if (props.price !== undefined) this.props.price = props.price;
    if (props.requiresConsultation !== undefined) this.props.requiresConsultation = props.requiresConsultation;
    if (props.requiresDeposit !== undefined) this.props.requiresDeposit = props.requiresDeposit;
    if (props.depositRule !== undefined) this.props.depositRule = props.depositRule;
    if (props.depositAmount !== undefined) this.props.depositAmount = props.depositAmount;
    if (props.requiresOwnMaterials !== undefined) this.props.requiresOwnMaterials = props.requiresOwnMaterials;
    if (props.requiredResourceType !== undefined) this.props.requiredResourceType = props.requiredResourceType;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
