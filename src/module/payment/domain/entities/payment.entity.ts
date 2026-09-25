import { PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client';
import { PaymentAmount } from '../value-objects/payment-amount.vo.js';
import { InvalidPaymentStatusTransitionException } from '../exceptions/payment-domain.exception.js';

export interface PaymentProps {
  id: string;
  idempotencyKey: string;
  bookingId: string;
  salonId: string;
  provider: PaymentProvider;
  providerTxId?: string | null;
  externalRef?: string | null;
  paymentAmount: PaymentAmount;
  type: PaymentType;
  status: PaymentStatus;
  rawWebhookData?: any;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PaymentEntity {
  private _props: PaymentProps;

  constructor(props: PaymentProps) {
    this._props = {
      ...props,
      providerTxId: props.providerTxId ?? null,
      externalRef: props.externalRef ?? null,
      rawWebhookData: props.rawWebhookData ?? null,
      paidAt: props.paidAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get idempotencyKey(): string {
    return this._props.idempotencyKey;
  }

  public get bookingId(): string {
    return this._props.bookingId;
  }

  public get salonId(): string {
    return this._props.salonId;
  }

  public get provider(): PaymentProvider {
    return this._props.provider;
  }

  public get providerTxId(): string | null {
    return this._props.providerTxId ?? null;
  }

  public get externalRef(): string | null {
    return this._props.externalRef ?? null;
  }

  public get paymentAmount(): PaymentAmount {
    return this._props.paymentAmount;
  }

  public get amount(): number {
    return this._props.paymentAmount.amount;
  }

  public get commissionAmount(): number {
    return this._props.paymentAmount.commissionAmount;
  }

  public get netSalonAmount(): number {
    return this._props.paymentAmount.netSalonAmount;
  }

  public get currency(): string {
    return this._props.paymentAmount.currency;
  }

  public get type(): PaymentType {
    return this._props.type;
  }

  public get status(): PaymentStatus {
    return this._props.status;
  }

  public get rawWebhookData(): any {
    return this._props.rawWebhookData;
  }

  public get paidAt(): Date | null {
    return this._props.paidAt ?? null;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public isSettled(): boolean {
    return this._props.status === PaymentStatus.SUCCEEDED;
  }

  public markPending(externalRef?: string): void {
    if (this._props.status !== PaymentStatus.INITIATED) {
      throw new InvalidPaymentStatusTransitionException(this._props.status, PaymentStatus.PENDING);
    }
    this._props.status = PaymentStatus.PENDING;
    if (externalRef) this._props.externalRef = externalRef;
    this._props.updatedAt = new Date();
  }

  public markSuccess(providerTxId: string, paidAt: Date = new Date(), webhookPayload?: any): void {
    if (
      this._props.status !== PaymentStatus.INITIATED &&
      this._props.status !== PaymentStatus.PENDING
    ) {
      throw new InvalidPaymentStatusTransitionException(this._props.status, PaymentStatus.SUCCEEDED);
    }
    this._props.status = PaymentStatus.SUCCEEDED;
    this._props.providerTxId = providerTxId;
    this._props.paidAt = paidAt;
    if (webhookPayload) this._props.rawWebhookData = webhookPayload;
    this._props.updatedAt = new Date();
  }

  public markFailed(webhookPayload?: any): void {
    if (
      this._props.status !== PaymentStatus.INITIATED &&
      this._props.status !== PaymentStatus.PENDING
    ) {
      throw new InvalidPaymentStatusTransitionException(this._props.status, PaymentStatus.FAILED);
    }
    this._props.status = PaymentStatus.FAILED;
    if (webhookPayload) this._props.rawWebhookData = webhookPayload;
    this._props.updatedAt = new Date();
  }

  public markExpired(): void {
    if (
      this._props.status !== PaymentStatus.INITIATED &&
      this._props.status !== PaymentStatus.PENDING
    ) {
      throw new InvalidPaymentStatusTransitionException(this._props.status, PaymentStatus.EXPIRED);
    }
    this._props.status = PaymentStatus.EXPIRED;
    this._props.updatedAt = new Date();
  }

  public markRefunded(): void {
    if (this._props.status !== PaymentStatus.SUCCEEDED) {
      throw new InvalidPaymentStatusTransitionException(this._props.status, PaymentStatus.REFUNDED);
    }
    this._props.status = PaymentStatus.REFUNDED;
    this._props.updatedAt = new Date();
  }
}
