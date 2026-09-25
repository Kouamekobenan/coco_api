import { LoyaltyScope, LoyaltyTxType } from '@prisma/client';
import { InsufficientLoyaltyPointsException } from '../exceptions/payment-domain.exception.js';

export interface LoyaltyTransactionProps {
  id: string;
  loyaltyAccountId: string;
  points: number; // + pour gain, - pour utilisation
  txType: LoyaltyTxType;
  description?: string | null;
  referenceId?: string | null;
  createdAt?: Date;
}

export interface LoyaltyAccountProps {
  id: string;
  scope: LoyaltyScope;
  userId?: string | null;
  salonCustomerId?: string | null;
  salonId?: string | null;
  pointsBalance: number;
  transactions?: LoyaltyTransactionProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class LoyaltyAccountEntity {
  private _props: LoyaltyAccountProps;

  constructor(props: LoyaltyAccountProps) {
    this._props = {
      ...props,
      userId: props.userId ?? null,
      salonCustomerId: props.salonCustomerId ?? null,
      salonId: props.salonId ?? null,
      transactions: props.transactions ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get scope(): LoyaltyScope {
    return this._props.scope;
  }

  public get userId(): string | null {
    return this._props.userId ?? null;
  }

  public get salonCustomerId(): string | null {
    return this._props.salonCustomerId ?? null;
  }

  public get salonId(): string | null {
    return this._props.salonId ?? null;
  }

  public get pointsBalance(): number {
    return this._props.pointsBalance;
  }

  public get transactions(): LoyaltyTransactionProps[] {
    return [...(this._props.transactions ?? [])];
  }

  public earnPoints(points: number, description?: string, referenceId?: string): void {
    if (points <= 0) return;
    this._props.pointsBalance += points;
    this._props.transactions = [
      ...(this._props.transactions ?? []),
      {
        id: crypto.randomUUID(),
        loyaltyAccountId: this._props.id,
        points,
        txType: LoyaltyTxType.EARNED,
        description: description ?? 'Points gagnés lors d\'une prestation',
        referenceId: referenceId ?? null,
        createdAt: new Date(),
      },
    ];
    this._props.updatedAt = new Date();
  }

  public redeemPoints(points: number, description?: string, referenceId?: string): void {
    if (points <= 0) return;
    if (this._props.pointsBalance < points) {
      throw new InsufficientLoyaltyPointsException(this._props.pointsBalance, points);
    }
    this._props.pointsBalance -= points;
    this._props.transactions = [
      ...(this._props.transactions ?? []),
      {
        id: crypto.randomUUID(),
        loyaltyAccountId: this._props.id,
        points: -points,
        txType: LoyaltyTxType.REDEEMED,
        description: description ?? 'Utilisation de points de fidélité',
        referenceId: referenceId ?? null,
        createdAt: new Date(),
      },
    ];
    this._props.updatedAt = new Date();
  }
}
