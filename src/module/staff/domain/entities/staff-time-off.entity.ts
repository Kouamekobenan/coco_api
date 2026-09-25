import { InvalidTimeOffRangeException } from '../exceptions/staff-domain.exception.js';

export type TimeOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StaffTimeOffProps {
  id: string;
  staffId: string;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
  status: TimeOffStatus;
  createdAt: Date;
}

export class StaffTimeOffEntity {
  private constructor(private readonly props: StaffTimeOffProps) {}

  public static create(props: {
    id: string;
    staffId: string;
    startDate: Date;
    endDate: Date;
    reason?: string | null;
    status?: TimeOffStatus;
  }): StaffTimeOffEntity {
    if (props.startDate >= props.endDate) {
      throw new InvalidTimeOffRangeException();
    }

    return new StaffTimeOffEntity({
      id: props.id,
      staffId: props.staffId,
      startDate: props.startDate,
      endDate: props.endDate,
      reason: props.reason ?? null,
      status: props.status ?? 'PENDING',
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: StaffTimeOffProps): StaffTimeOffEntity {
    return new StaffTimeOffEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getStaffId(): string {
    return this.props.staffId;
  }

  public getStartDate(): Date {
    return this.props.startDate;
  }

  public getEndDate(): Date {
    return this.props.endDate;
  }

  public getReason(): string | null {
    return this.props.reason ?? null;
  }

  public getStatus(): TimeOffStatus {
    return this.props.status;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public approve(): void {
    this.props.status = 'APPROVED';
  }

  public reject(): void {
    this.props.status = 'REJECTED';
  }
}
