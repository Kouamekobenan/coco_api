import { InvalidWorkingHourException } from '../exceptions/staff-domain.exception.js';

export interface StaffWorkingHourProps {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0 = Dimanche à 6 = Samedi
  startTime: string; // "08:00"
  endTime: string;   // "18:00"
  isOff: boolean;
}

export class StaffWorkingHourEntity {
  private constructor(private readonly props: StaffWorkingHourProps) {}

  public static create(props: {
    id: string;
    staffId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff?: boolean;
  }): StaffWorkingHourEntity {
    if (!props.isOff && props.startTime >= props.endTime) {
      throw new InvalidWorkingHourException(
        `L'heure de début (${props.startTime}) doit être strictement antérieure à l'heure de fin (${props.endTime}).`,
      );
    }

    return new StaffWorkingHourEntity({
      id: props.id,
      staffId: props.staffId,
      dayOfWeek: props.dayOfWeek,
      startTime: props.startTime,
      endTime: props.endTime,
      isOff: props.isOff ?? false,
    });
  }

  public static reconstitute(props: StaffWorkingHourProps): StaffWorkingHourEntity {
    return new StaffWorkingHourEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getStaffId(): string {
    return this.props.staffId;
  }

  public getDayOfWeek(): number {
    return this.props.dayOfWeek;
  }

  public getStartTime(): string {
    return this.props.startTime;
  }

  public getEndTime(): string {
    return this.props.endTime;
  }

  public isOff(): boolean {
    return this.props.isOff;
  }
}
