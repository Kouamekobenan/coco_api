import { LoyaltyScope, PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client';
import { PaymentEntity } from '../entities/payment.entity.js';
import { RefundEntity } from '../entities/refund.entity.js';
import { LedgerEntryEntity } from '../entities/ledger-entry.entity.js';
import { LoyaltyAccountEntity } from '../entities/loyalty-account.entity.js';

export interface PaymentFilters {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  type?: PaymentType;
  bookingId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;
  take?: number;
}

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentEntity | null>;
  findByIdempotencyKey(key: string): Promise<PaymentEntity | null>;
  findByProviderTxId(txId: string): Promise<PaymentEntity | null>;
  findByBookingId(bookingId: string): Promise<PaymentEntity[]>;
  findBySalonId(
    salonId: string,
    filters?: PaymentFilters,
  ): Promise<{ payments: PaymentEntity[]; total: number }>;
  save(payment: PaymentEntity): Promise<PaymentEntity>;
  update(payment: PaymentEntity): Promise<PaymentEntity>;

  // Refunds
  saveRefund(refund: RefundEntity): Promise<RefundEntity>;
  findRefundsByPaymentId(paymentId: string): Promise<RefundEntity[]>;

  // Accounting Ledger (Journal immuable)
  saveLedgerEntry(entry: LedgerEntryEntity): Promise<LedgerEntryEntity>;
  findLedgerBySalonId(
    salonId: string,
    page?: number,
    limit?: number,
  ): Promise<{ entries: LedgerEntryEntity[]; total: number; currentBalance: number }>;
  getSalonBalance(salonId: string): Promise<number>;

  // Loyalty
  findLoyaltyAccount(
    scope: LoyaltyScope,
    userId?: string | null,
    salonCustomerId?: string | null,
    salonId?: string | null,
  ): Promise<LoyaltyAccountEntity | null>;
  saveLoyaltyAccount(account: LoyaltyAccountEntity): Promise<LoyaltyAccountEntity>;
  updateLoyaltyAccount(account: LoyaltyAccountEntity): Promise<LoyaltyAccountEntity>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
