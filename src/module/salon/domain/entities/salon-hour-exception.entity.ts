export interface SalonHourExceptionProps {
  id: string;
  salonId: string;
  date: Date;
  openTime?: string | null;
  closeTime?: string | null;
  isClosed: boolean;
  reason?: string | null;
}

export class SalonHourExceptionEntity {
  private constructor(private readonly props: SalonHourExceptionProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    date: Date;
    openTime?: string | null;
    closeTime?: string | null;
    isClosed?: boolean;
    reason?: string | null;
  }): SalonHourExceptionEntity {
    return new SalonHourExceptionEntity({
      id: props.id,
      salonId: props.salonId,
      date: props.date,
      openTime: props.openTime ?? null,
      closeTime: props.closeTime ?? null,
      isClosed: props.isClosed ?? true,
      reason: props.reason ?? null,
    });
  }

  public static reconstitute(props: SalonHourExceptionProps): SalonHourExceptionEntity {
    return new SalonHourExceptionEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getDate(): Date {
    return this.props.date;
  }

  public getOpenTime(): string | null {
    return this.props.openTime ?? null;
  }

  public getCloseTime(): string | null {
    return this.props.closeTime ?? null;
  }

  public isClosed(): boolean {
    return this.props.isClosed;
  }

  public getReason(): string | null {
    return this.props.reason ?? null;
  }
}
