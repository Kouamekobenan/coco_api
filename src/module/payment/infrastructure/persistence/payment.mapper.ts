import {
  Payment as PrismaPayment,
  AccountingLedger as PrismaLedger,
  LoyaltyAccount as PrismaLoyaltyAccount,
  LoyaltyTransaction as PrismaLoyaltyTx,
  Prisma,
} from '@prisma/client';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { LoyaltyAccountEntity } from '../../domain/entities/loyalty-account.entity.js';
import { PaymentAmount } from '../../domain/value-objects/payment-amount.vo.js';

type PrismaLoyaltyWithTxs = PrismaLoyaltyAccount & {
  transactions?: PrismaLoyaltyTx[];
};

export class PaymentMapper {
  public static toEntity(raw: PrismaPayment): PaymentEntity {
    const paymentAmount = new PaymentAmount(
      Number(raw.amount),
      Number(raw.commissionAmount),
      raw.currency,
    );

    return new PaymentEntity({
      id: raw.id,
      idempotencyKey: raw.idempotencyKey,
      bookingId: raw.bookingId,
      salonId: raw.salonId,
      provider: raw.provider,
      providerTxId: raw.providerTxId,
      externalRef: raw.externalRef,
      paymentAmount,
      type: raw.type,
      status: raw.status,
      rawWebhookData: raw.rawWebhookData,
      paidAt: raw.paidAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(entity: PaymentEntity): Prisma.PaymentCreateInput {
    return {
      id: entity.id,
      idempotencyKey: entity.idempotencyKey,
      provider: entity.provider,
      providerTxId: entity.providerTxId,
      externalRef: entity.externalRef,
      amount: new Prisma.Decimal(entity.amount),
      commissionAmount: new Prisma.Decimal(entity.commissionAmount),
      currency: entity.currency,
      type: entity.type,
      status: entity.status,
      rawWebhookData: entity.rawWebhookData,
      paidAt: entity.paidAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      booking: {
        connect: { id: entity.bookingId },
      },
      salon: {
        connect: { id: entity.salonId },
      },
    };
  }

  public static toPrismaUpdate(entity: PaymentEntity): Prisma.PaymentUpdateInput {
    return {
      providerTxId: entity.providerTxId,
      externalRef: entity.externalRef,
      status: entity.status,
      rawWebhookData: entity.rawWebhookData,
      paidAt: entity.paidAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class LedgerMapper {
  public static toEntity(raw: PrismaLedger): LedgerEntryEntity {
    return new LedgerEntryEntity({
      id: raw.id,
      salonId: raw.salonId,
      paymentId: raw.paymentId,
      entryType: raw.entryType,
      amount: Number(raw.amount),
      balanceAfter: Number(raw.balanceAfter),
      description: raw.description,
      createdAt: raw.createdAt,
    });
  }

  public static toPrismaCreate(entity: LedgerEntryEntity): Prisma.AccountingLedgerCreateInput {
    return {
      id: entity.id,
      entryType: entity.entryType,
      amount: new Prisma.Decimal(entity.amount),
      balanceAfter: new Prisma.Decimal(entity.balanceAfter),
      description: entity.description,
      createdAt: entity.createdAt,
      salon: {
        connect: { id: entity.salonId },
      },
      ...(entity.paymentId ? { payment: { connect: { id: entity.paymentId } } } : {}),
    };
  }
}

export class LoyaltyMapper {
  public static toEntity(raw: PrismaLoyaltyWithTxs): LoyaltyAccountEntity {
    const transactions = (raw.transactions ?? []).map((t) => ({
      id: t.id,
      loyaltyAccountId: t.loyaltyAccountId,
      points: t.points,
      txType: t.txType,
      description: t.description,
      referenceId: t.referenceId,
      createdAt: t.createdAt,
    }));

    return new LoyaltyAccountEntity({
      id: raw.id,
      scope: raw.scope,
      userId: raw.userId,
      salonCustomerId: raw.salonCustomerId,
      salonId: raw.salonId,
      pointsBalance: raw.pointsBalance,
      transactions,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
