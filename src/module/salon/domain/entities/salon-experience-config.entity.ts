export type BookingModeType = 'APPOINTMENT' | 'WALK_IN' | 'HYBRID';

export interface SalonExperienceConfigProps {
  id: string;
  salonId: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  coverMediaUrl?: string | null;
  layout: string;
  bookingMode: BookingModeType;
  enableQueue: boolean;
  enableDeposit: boolean;
  enableLoyalty: boolean;
  cancelFreeLimitHours: number;
  delayAlertThresholdMin: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SalonExperienceConfigEntity {
  private constructor(private readonly props: SalonExperienceConfigProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    coverMediaUrl?: string | null;
    layout?: string;
    bookingMode?: BookingModeType;
    enableQueue?: boolean;
    enableDeposit?: boolean;
    enableLoyalty?: boolean;
    cancelFreeLimitHours?: number;
    delayAlertThresholdMin?: number;
  }): SalonExperienceConfigEntity {
    const now = new Date();
    return new SalonExperienceConfigEntity({
      id: props.id,
      salonId: props.salonId,
      theme: props.theme ?? 'default',
      primaryColor: props.primaryColor ?? '#E05A47',
      secondaryColor: props.secondaryColor ?? '#1A1A1A',
      coverMediaUrl: props.coverMediaUrl ?? null,
      layout: props.layout ?? 'standard',
      bookingMode: props.bookingMode ?? 'HYBRID',
      enableQueue: props.enableQueue ?? true,
      enableDeposit: props.enableDeposit ?? true,
      enableLoyalty: props.enableLoyalty ?? true,
      cancelFreeLimitHours: props.cancelFreeLimitHours ?? 4,
      delayAlertThresholdMin: props.delayAlertThresholdMin ?? 20,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: SalonExperienceConfigProps): SalonExperienceConfigEntity {
    return new SalonExperienceConfigEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getTheme(): string {
    return this.props.theme;
  }

  public getPrimaryColor(): string {
    return this.props.primaryColor;
  }

  public getSecondaryColor(): string {
    return this.props.secondaryColor;
  }

  public getCoverMediaUrl(): string | null {
    return this.props.coverMediaUrl ?? null;
  }

  public getLayout(): string {
    return this.props.layout;
  }

  public getBookingMode(): BookingModeType {
    return this.props.bookingMode;
  }

  public isEnableQueue(): boolean {
    return this.props.enableQueue;
  }

  public isEnableDeposit(): boolean {
    return this.props.enableDeposit;
  }

  public isEnableLoyalty(): boolean {
    return this.props.enableLoyalty;
  }

  public getCancelFreeLimitHours(): number {
    return this.props.cancelFreeLimitHours;
  }

  public getDelayAlertThresholdMin(): number {
    return this.props.delayAlertThresholdMin;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: {
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    coverMediaUrl?: string | null;
    layout?: string;
    bookingMode?: BookingModeType;
    enableQueue?: boolean;
    enableDeposit?: boolean;
    enableLoyalty?: boolean;
    cancelFreeLimitHours?: number;
    delayAlertThresholdMin?: number;
  }): void {
    if (props.theme !== undefined) this.props.theme = props.theme;
    if (props.primaryColor !== undefined) this.props.primaryColor = props.primaryColor;
    if (props.secondaryColor !== undefined) this.props.secondaryColor = props.secondaryColor;
    if (props.coverMediaUrl !== undefined) this.props.coverMediaUrl = props.coverMediaUrl;
    if (props.layout !== undefined) this.props.layout = props.layout;
    if (props.bookingMode !== undefined) this.props.bookingMode = props.bookingMode;
    if (props.enableQueue !== undefined) this.props.enableQueue = props.enableQueue;
    if (props.enableDeposit !== undefined) this.props.enableDeposit = props.enableDeposit;
    if (props.enableLoyalty !== undefined) this.props.enableLoyalty = props.enableLoyalty;
    if (props.cancelFreeLimitHours !== undefined) this.props.cancelFreeLimitHours = props.cancelFreeLimitHours;
    if (props.delayAlertThresholdMin !== undefined) this.props.delayAlertThresholdMin = props.delayAlertThresholdMin;
    this.props.updatedAt = new Date();
  }
}
