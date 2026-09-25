import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { LoyaltyAccountEntity } from '../../domain/entities/loyalty-account.entity.js';
import {
  PaymentResponseDto,
  LedgerEntryResponseDto,
  LoyaltyAccountResponseDto,
} from './payment-response.dto.js';

export class PaymentDtoMapper {
  public static toPaymentResponse(entity: PaymentEntity, paymentUrl?: string | null): PaymentResponseDto {
    return {
      id: entity.id,
      idempotencyKey: entity.idempotencyKey,
      bookingId: entity.bookingId,
      salonId: entity.salonId,
      provider: entity.provider,
      providerTxId: entity.providerTxId,
      externalRef: entity.externalRef,
      amount: entity.amount,
      commissionAmount: entity.commissionAmount,
      netSalonAmount: entity.netSalonAmount,
      currency: entity.currency,
      type: entity.type,
      status: entity.status,
      paidAt: entity.paidAt ? entity.paidAt.toISOString() : null,
      paymentUrl: paymentUrl ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  public static toLedgerResponse(entity: LedgerEntryEntity): LedgerEntryResponseDto {
    return {
      id: entity.id,
      salonId: entity.salonId,
      paymentId: entity.paymentId,
      entryType: entity.entryType,
      amount: entity.amount,
      balanceAfter: entity.balanceAfter,
      description: entity.description,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  public static toLoyaltyResponse(entity: LoyaltyAccountEntity): LoyaltyAccountResponseDto {
    return {
      id: entity.id,
      scope: entity.scope,
      userId: entity.userId,
      salonCustomerId: entity.salonCustomerId,
      salonId: entity.salonId,
      pointsBalance: entity.pointsBalance,
      history: entity.transactions.map((tx) => ({
        id: tx.id,
        points: tx.points,
        txType: tx.txType,
        description: tx.description,
        referenceId: tx.referenceId,
        createdAt: tx.createdAt ? tx.createdAt.toISOString() : new Date().toISOString(),
      })),
    };
  }
}
