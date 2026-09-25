export interface SalonHourProps {
  id: string;
  salonId: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  openTime: string;  // Format "08:30"
  closeTime: string; // Format "19:30"
  isClosed: boolean;
}

export class SalonHourEntity {
  private constructor(private readonly props: SalonHourProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }): SalonHourEntity {
    return new SalonHourEntity({
      id: props.id,
      salonId: props.salonId,
      dayOfWeek: props.dayOfWeek,
      openTime: props.openTime,
      closeTime: props.closeTime,
      isClosed: props.isClosed ?? false,
    });
  }

  public static reconstitute(props: SalonHourProps): SalonHourEntity {
    return new SalonHourEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getDayOfWeek(): number {
    return this.props.dayOfWeek;
  }

  public getOpenTime(): string {
    return this.props.openTime;
  }

  public getCloseTime(): string {
    return this.props.closeTime;
  }

  public isClosed(): boolean {
    return this.props.isClosed;
  }

  public update(props: { openTime?: string; closeTime?: string; isClosed?: boolean }): void {
    if (props.openTime !== undefined) this.props.openTime = props.openTime;
    if (props.closeTime !== undefined) this.props.closeTime = props.closeTime;
    if (props.isClosed !== undefined) this.props.isClosed = props.isClosed;
  }
}
