import { InvalidServiceDurationsException } from '../exceptions/service-domain.exception.js';

export class ServiceDurations {
  private readonly min: number;
  private readonly estimated: number;
  private readonly max: number;
  private readonly setup: number;
  private readonly buffer: number;

  constructor(
    durationMin: number,
    durationEstimated: number,
    durationMax: number,
    setupMinutes = 15,
    bufferMinutes = 15,
  ) {
    if (durationMin <= 0 || durationEstimated < durationMin || durationMax < durationEstimated) {
      throw new InvalidServiceDurationsException(durationMin, durationEstimated, durationMax);
    }

    this.min = durationMin;
    this.estimated = durationEstimated;
    this.max = durationMax;
    this.setup = Math.max(0, setupMinutes);
    this.buffer = Math.max(0, bufferMinutes);
  }

  public getMin(): number {
    return this.min;
  }

  public getEstimated(): number {
    return this.estimated;
  }

  public getMax(): number {
    return this.max;
  }

  public getSetup(): number {
    return this.setup;
  }

  public getBuffer(): number {
    return this.buffer;
  }

  /**
   * Durée totale standard bloquée dans le planning : setup + estimated + buffer
   */
  public getTotalProjectedMinutes(): number {
    return this.setup + this.estimated + this.buffer;
  }

  /**
   * Durée totale worst-case bloquée pour sécurité : setup + max + buffer
   */
  public getTotalWorstCaseMinutes(): number {
    return this.setup + this.max + this.buffer;
  }

  /**
   * Indique s'il s'agit d'une prestation longue (>= 5 heures)
   */
  public isLongService(): boolean {
    return this.estimated >= 300;
  }
}
