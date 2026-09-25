import { PhaseType } from '@prisma/client';

export interface BookingPhaseProps {
  id: string;
  bookingId: string;
  phaseType: PhaseType;
  name: string;
  sequenceOrder: number;
  durationMinutes: number;
  resourceId?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
}

export class BookingPhaseEntity {
  private _props: BookingPhaseProps;

  constructor(props: BookingPhaseProps) {
    if (props.durationMinutes <= 0) {
      throw new Error('La durée de la phase doit être supérieure à zéro.');
    }
    this._props = {
      ...props,
      resourceId: props.resourceId ?? null,
      startedAt: props.startedAt ?? null,
      endedAt: props.endedAt ?? null,
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get bookingId(): string {
    return this._props.bookingId;
  }

  public get phaseType(): PhaseType {
    return this._props.phaseType;
  }

  public get name(): string {
    return this._props.name;
  }

  public get sequenceOrder(): number {
    return this._props.sequenceOrder;
  }

  public get durationMinutes(): number {
    return this._props.durationMinutes;
  }

  public get resourceId(): string | null {
    return this._props.resourceId ?? null;
  }

  public get startedAt(): Date | null {
    return this._props.startedAt ?? null;
  }

  public get endedAt(): Date | null {
    return this._props.endedAt ?? null;
  }

  public start(at: Date = new Date()): void {
    this._props.startedAt = at;
  }

  public end(at: Date = new Date()): void {
    if (this._props.startedAt && at < this._props.startedAt) {
      throw new Error("L'heure de fin de phase ne peut pas être antérieure à l'heure de début.");
    }
    this._props.endedAt = at;
  }

  public updateDetails(name: string, durationMinutes: number, phaseType: PhaseType, resourceId?: string | null): void {
    if (durationMinutes <= 0) {
      throw new Error('La durée de la phase doit être supérieure à zéro.');
    }
    this._props.name = name;
    this._props.durationMinutes = durationMinutes;
    this._props.phaseType = phaseType;
    this._props.resourceId = resourceId ?? null;
  }
}
