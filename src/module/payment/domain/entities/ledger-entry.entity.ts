import { LedgerEntryType } from '@prisma/client';

export interface LedgerEntryProps {
  id: string;
  salonId: string;
  paymentId?: string | null;
  entryType: LedgerEntryType;
  amount: number;       // + pour crédit salon, - pour débit/commission
  balanceAfter: number; // Solde séquentiel garanti
  description: string;
  createdAt?: Date;
}

export class LedgerEntryEntity {
  private _props: LedgerEntryProps;

  constructor(props: LedgerEntryProps) {
    this._props = {
      ...props,
      paymentId: props.paymentId ?? null,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get salonId(): string {
    return this._props.salonId;
  }

  public get paymentId(): string | null {
    return this._props.paymentId ?? null;
  }

  public get entryType(): LedgerEntryType {
    return this._props.entryType;
  }

  public get amount(): number {
    return this._props.amount;
  }

  public get balanceAfter(): number {
    return this._props.balanceAfter;
  }

  public get description(): string {
    return this._props.description;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }
}
