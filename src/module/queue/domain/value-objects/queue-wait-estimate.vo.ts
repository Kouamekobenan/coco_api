export class QueueWaitEstimate {
  private readonly _minMinutes: number;
  private readonly _maxMinutes: number;
  private readonly _projectedStart: Date | null;

  constructor(minMinutes: number, maxMinutes: number, projectedStart?: Date | null) {
    if (minMinutes < 0 || maxMinutes < 0) {
      throw new Error("Les estimations d'attente ne peuvent pas être négatives.");
    }
    if (minMinutes > maxMinutes) {
      throw new Error("L'attente minimale ne peut pas dépasser l'attente maximale.");
    }

    this._minMinutes = Math.round(minMinutes);
    this._maxMinutes = Math.round(maxMinutes);
    this._projectedStart = projectedStart ? new Date(projectedStart) : null;
  }

  public get minMinutes(): number {
    return this._minMinutes;
  }

  public get maxMinutes(): number {
    return this._maxMinutes;
  }

  public get projectedStart(): Date | null {
    return this._projectedStart ? new Date(this._projectedStart) : null;
  }

  public get formattedRange(): string {
    if (this._minMinutes === this._maxMinutes) {
      return `${this._minMinutes} min`;
    }
    return `${this._minMinutes} - ${this._maxMinutes} min`;
  }

  public static zero(): QueueWaitEstimate {
    return new QueueWaitEstimate(0, 0, new Date());
  }
}
