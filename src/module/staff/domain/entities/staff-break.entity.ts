import { InvalidWorkingHourException } from '../exceptions/staff-domain.exception.js';

export interface StaffBreakProps {
  id: string;
  staffId: string;
  dayOfWeek?: number | null; // 0..6 si récurrent
  date?: Date | null;        // si ponctuel
  startTime: string;         // "13:00"
  endTime: string;           // "14:00"
  reason?: string | null;    // "Déjeuner", "Prière", "Repos"
}

export class StaffBreakEntity {
  private constructor(private readonly props: StaffBreakProps) {}

  public static create(props: {
    id: string;
    staffId: string;
    dayOfWeek?: number | null;
    date?: Date | null;
    startTime: string;
    endTime: string;
    reason?: string | null;
  }): StaffBreakEntity {
    if (props.startTime >= props.endTime) {
      throw new InvalidWorkingHourException(
        `L'heure de début de pause (${props.startTime}) doit précéder l'heure de fin (${props.endTime}).`,
      );
    }

    return new StaffBreakEntity({
      id: props.id,
      staffId: props.staffId,
      dayOfWeek: props.dayOfWeek ?? null,
      date: props.date ?? null,
      startTime: props.startTime,
      endTime: props.endTime,
      reason: props.reason ?? null,
    });
  }

  public static reconstitute(props: StaffBreakProps): StaffBreakEntity {
    return new StaffBreakEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getStaffId(): string {
    return this.props.staffId;
  }

  public getDayOfWeek(): number | null {
    return this.props.dayOfWeek ?? null;
  }

  public getDate(): Date | null {
    return this.props.date ?? null;
  }

  public getStartTime(): string {
    return this.props.startTime;
  }

  public getEndTime(): string {
    return this.props.endTime;
  }

  public getReason(): string | null {
    return this.props.reason ?? null;
  }
}
