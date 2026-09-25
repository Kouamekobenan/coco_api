export interface RefundProps {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string | null;
  providerRefundId?: string | null;
  status?: string;
  createdAt?: Date;
}

export class RefundEntity {
  private _props: RefundProps;

  constructor(props: RefundProps) {
    if (props.amount <= 0) {
      throw new Error('Le montant du remboursement doit être supérieur à zéro.');
    }
    this._props = {
      ...props,
      reason: props.reason ?? null,
      providerRefundId: props.providerRefundId ?? null,
      status: props.status ?? 'SUCCEEDED',
      createdAt: props.createdAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get paymentId(): string {
    return this._props.paymentId;
  }

  public get amount(): number {
    return this._props.amount;
  }

  public get reason(): string | null {
    return this._props.reason ?? null;
  }

  public get providerRefundId(): string | null {
    return this._props.providerRefundId ?? null;
  }

  public get status(): string {
    return this._props.status ?? 'SUCCEEDED';
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }
}
