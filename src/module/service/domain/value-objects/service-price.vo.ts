import { InvalidServicePriceException } from '../exceptions/service-domain.exception.js';

export class ServicePrice {
  private readonly from: number;
  private readonly to: number | null;

  constructor(priceFrom: number, priceTo?: number | null) {
    if (typeof priceFrom !== 'number' || priceFrom < 0 || Number.isNaN(priceFrom)) {
      throw new InvalidServicePriceException('Le prix de départ doit être un nombre positif ou nul.');
    }

    if (priceTo !== undefined && priceTo !== null) {
      if (typeof priceTo !== 'number' || priceTo < priceFrom || Number.isNaN(priceTo)) {
        throw new InvalidServicePriceException(
          `Le prix plafond (${priceTo} FCFA) doit être supérieur ou égal au prix de départ (${priceFrom} FCFA).`,
        );
      }
      this.to = priceTo;
    } else {
      this.to = null;
    }

    this.from = priceFrom;
  }

  public getFrom(): number {
    return this.from;
  }

  public getTo(): number | null {
    return this.to;
  }

  public isFixed(): boolean {
    return this.to === null || this.to === this.from;
  }
}
