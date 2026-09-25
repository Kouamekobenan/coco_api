export class BookingTimeSlot {
  private readonly _scheduledStart: Date;
  private readonly _projectedEnd: Date;
  private readonly _worstCaseEnd: Date;

  constructor(scheduledStart: Date, projectedEnd: Date, worstCaseEnd: Date) {
    if (scheduledStart >= projectedEnd) {
      throw new Error("L'heure de début doit être strictement antérieure à l'heure de fin prévisionnelle.");
    }
    if (projectedEnd > worstCaseEnd) {
      throw new Error("La fin prévisionnelle ne peut pas dépasser la fin au pire des cas.");
    }

    this._scheduledStart = new Date(scheduledStart);
    this._projectedEnd = new Date(projectedEnd);
    this._worstCaseEnd = new Date(worstCaseEnd);
  }

  public get scheduledStart(): Date {
    return new Date(this._scheduledStart);
  }

  public get projectedEnd(): Date {
    return new Date(this._projectedEnd);
  }

  public get worstCaseEnd(): Date {
    return new Date(this._worstCaseEnd);
  }

  public get projectedDurationMinutes(): number {
    return Math.round((this._projectedEnd.getTime() - this._scheduledStart.getTime()) / (1000 * 60));
  }

  public get worstCaseDurationMinutes(): number {
    return Math.round((this._worstCaseEnd.getTime() - this._scheduledStart.getTime()) / (1000 * 60));
  }

  public overlaps(otherStart: Date, otherEnd: Date): boolean {
    return this._scheduledStart < otherEnd && this._projectedEnd > otherStart;
  }

  public overlapsWorstCase(otherStart: Date, otherEnd: Date): boolean {
    return this._scheduledStart < otherEnd && this._worstCaseEnd > otherStart;
  }

  public static calculate(
    scheduledStart: Date,
    setupMinutes = 15,
    durationEstimated = 60,
    durationMax = 90,
    bufferMinutes = 15,
  ): BookingTimeSlot {
    const start = new Date(scheduledStart);
    const projectedTotalMinutes = setupMinutes + durationEstimated + bufferMinutes;
    const worstCaseTotalMinutes = setupMinutes + durationMax + bufferMinutes;

    const projectedEnd = new Date(start.getTime() + projectedTotalMinutes * 60 * 1000);
    const worstCaseEnd = new Date(start.getTime() + worstCaseTotalMinutes * 60 * 1000);

    return new BookingTimeSlot(start, projectedEnd, worstCaseEnd);
  }
}
