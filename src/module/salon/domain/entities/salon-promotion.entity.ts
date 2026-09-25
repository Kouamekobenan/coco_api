export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface SalonPromotionProps {
  id: string;
  salonId: string;
  title: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SalonPromotionEntity {
  private constructor(private readonly props: SalonPromotionProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    title: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
  }): SalonPromotionEntity {
    const now = new Date();
    return new SalonPromotionEntity({
      id: props.id,
      salonId: props.salonId,
      title: props.title,
      description: props.description ?? null,
      discountType: props.discountType,
      discountValue: props.discountValue,
      startDate: props.startDate,
      endDate: props.endDate,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: SalonPromotionProps): SalonPromotionEntity {
    return new SalonPromotionEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getTitle(): string {
    return this.props.title;
  }

  public getDescription(): string | null {
    return this.props.description ?? null;
  }

  public getDiscountType(): DiscountType {
    return this.props.discountType;
  }

  public getDiscountValue(): number {
    return this.props.discountValue;
  }

  public getStartDate(): Date {
    return this.props.startDate;
  }

  public getEndDate(): Date {
    return this.props.endDate;
  }

  public isCurrentlyValid(referenceDate: Date = new Date()): boolean {
    return (
      this.props.isActive &&
      referenceDate >= this.props.startDate &&
      referenceDate <= this.props.endDate
    );
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
    title?: string;
    description?: string | null;
    discountType?: DiscountType;
    discountValue?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.discountType !== undefined) this.props.discountType = props.discountType;
    if (props.discountValue !== undefined) this.props.discountValue = props.discountValue;
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.endDate !== undefined) this.props.endDate = props.endDate;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
