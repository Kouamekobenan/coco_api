import { InvalidPaymentAmountException } from '../exceptions/payment-domain.exception.js';

export class PaymentAmount {
  private readonly _amount: number;
  private readonly _commissionAmount: number;
  private readonly _currency: string;

  constructor(amount: number, commissionAmount = 0, currency = 'XOF') {
    if (typeof amount !== 'number' || amount <= 0 || Number.isNaN(amount)) {
      throw new InvalidPaymentAmountException('Le montant doit être un nombre strictement positif.');
    }
    if (commissionAmount < 0 || commissionAmount > amount) {
      throw new InvalidPaymentAmountException('La commission ne peut être ni négative ni supérieure au montant total.');
    }

    this._amount = Math.round(amount * 100) / 100;
    this._commissionAmount = Math.round(commissionAmount * 100) / 100;
    this._currency = currency.toUpperCase();
  }

  public get amount(): number {
    return this._amount;
  }

  public get commissionAmount(): number {
    return this._commissionAmount;
  }

  public get netSalonAmount(): number {
    return this._amount - this._commissionAmount;
  }

  public get currency(): string {
    return this._currency;
  }

  public static calculateCommission(
    amount: number,
    commissionRatePercent = 5,
    currency = 'XOF',
  ): PaymentAmount {
    const commission = Math.round((amount * commissionRatePercent) / 100);
    return new PaymentAmount(amount, commission, currency);
  }
}
