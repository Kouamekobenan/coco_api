export interface StaffServiceProps {
  id: string;
  staffId: string;
  serviceId: string;
  variantId?: string | null;
  customDurationMin?: number | null;
  customDurationEstimated?: number | null;
  customDurationMax?: number | null;
  isCapable: boolean;
}

export class StaffServiceEntity {
  private constructor(private readonly props: StaffServiceProps) {}

  public static create(props: {
    id: string;
    staffId: string;
    serviceId: string;
    variantId?: string | null;
    customDurationMin?: number | null;
    customDurationEstimated?: number | null;
    customDurationMax?: number | null;
    isCapable?: boolean;
  }): StaffServiceEntity {
    return new StaffServiceEntity({
      id: props.id,
      staffId: props.staffId,
      serviceId: props.serviceId,
      variantId: props.variantId ?? null,
      customDurationMin: props.customDurationMin ?? null,
      customDurationEstimated: props.customDurationEstimated ?? null,
      customDurationMax: props.customDurationMax ?? null,
      isCapable: props.isCapable ?? true,
    });
  }

  public static reconstitute(props: StaffServiceProps): StaffServiceEntity {
    return new StaffServiceEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getStaffId(): string {
    return this.props.staffId;
  }

  public getServiceId(): string {
    return this.props.serviceId;
  }

  public getVariantId(): string | null {
    return this.props.variantId ?? null;
  }

  public getCustomDurationMin(): number | null {
    return this.props.customDurationMin ?? null;
  }

  public getCustomDurationEstimated(): number | null {
    return this.props.customDurationEstimated ?? null;
  }

  public getCustomDurationMax(): number | null {
    return this.props.customDurationMax ?? null;
  }

  public isCapable(): boolean {
    return this.props.isCapable;
  }

  public update(props: {
    customDurationMin?: number | null;
    customDurationEstimated?: number | null;
    customDurationMax?: number | null;
    isCapable?: boolean;
  }): void {
    if (props.customDurationMin !== undefined) this.props.customDurationMin = props.customDurationMin;
    if (props.customDurationEstimated !== undefined) this.props.customDurationEstimated = props.customDurationEstimated;
    if (props.customDurationMax !== undefined) this.props.customDurationMax = props.customDurationMax;
    if (props.isCapable !== undefined) this.props.isCapable = props.isCapable;
  }
}
