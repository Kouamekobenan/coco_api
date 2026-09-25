import { Injectable } from '@nestjs/common';
import { LoyaltyScope, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  IPaymentRepository,
  PaymentFilters,
} from '../../domain/repositories/payment.repository.interface.js';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { RefundEntity } from '../../domain/entities/refund.entity.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { LoyaltyAccountEntity } from '../../domain/entities/loyalty-account.entity.js';
import {
  PaymentMapper,
  LedgerMapper,
  LoyaltyMapper,
} from './payment.mapper.js';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<PaymentEntity | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return PaymentMapper.toEntity(raw);
  }

  public async findByIdempotencyKey(key: string): Promise<PaymentEntity | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { idempotencyKey: key },
    });
    if (!raw) return null;
    return PaymentMapper.toEntity(raw);
  }

  public async findByProviderTxId(txId: string): Promise<PaymentEntity | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { providerTxId: txId },
    });
    if (!raw) return null;
    return PaymentMapper.toEntity(raw);
  }

  public async findByBookingId(bookingId: string): Promise<PaymentEntity[]> {
    const rawList = await this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return rawList.map((r) => PaymentMapper.toEntity(r));
  }

  public async findBySalonId(
    salonId: string,
    filters?: PaymentFilters,
  ): Promise<{ payments: PaymentEntity[]; total: number }> {
    const where: Prisma.PaymentWhereInput = {
      salonId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.provider ? { provider: filters.provider } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.bookingId ? { bookingId: filters.bookingId } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters?.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters?.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const [rawList, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 20,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: rawList.map((r) => PaymentMapper.toEntity(r)),
      total,
    };
  }

  public async save(payment: PaymentEntity): Promise<PaymentEntity> {
    const data = PaymentMapper.toPrismaCreate(payment);
    const raw = await this.prisma.payment.create({ data });
    return PaymentMapper.toEntity(raw);
  }

  public async update(payment: PaymentEntity): Promise<PaymentEntity> {
    const data = PaymentMapper.toPrismaUpdate(payment);
    const raw = await this.prisma.payment.update({
      where: { id: payment.id },
      data,
    });
    return PaymentMapper.toEntity(raw);
  }

  public async saveRefund(refund: RefundEntity): Promise<RefundEntity> {
    const raw = await this.prisma.refund.create({
      data: {
        id: refund.id,
        paymentId: refund.paymentId,
        amount: new Prisma.Decimal(refund.amount),
        reason: refund.reason,
        providerRefundId: refund.providerRefundId,
        status: refund.status,
        createdAt: refund.createdAt,
      },
    });

    return new RefundEntity({
      id: raw.id,
      paymentId: raw.paymentId,
      amount: Number(raw.amount),
      reason: raw.reason,
      providerRefundId: raw.providerRefundId,
      status: raw.status,
      createdAt: raw.createdAt,
    });
  }

  public async findRefundsByPaymentId(paymentId: string): Promise<RefundEntity[]> {
    const rawList = await this.prisma.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });

    return rawList.map(
      (r) =>
        new RefundEntity({
          id: r.id,
          paymentId: r.paymentId,
          amount: Number(r.amount),
          reason: r.reason,
          providerRefundId: r.providerRefundId,
          status: r.status,
          createdAt: r.createdAt,
        }),
    );
  }

  public async saveLedgerEntry(entry: LedgerEntryEntity): Promise<LedgerEntryEntity> {
    const data = LedgerMapper.toPrismaCreate(entry);
    const raw = await this.prisma.accountingLedger.create({ data });
    return LedgerMapper.toEntity(raw);
  }

  public async findLedgerBySalonId(
    salonId: string,
    page = 1,
    limit = 20,
  ): Promise<{ entries: LedgerEntryEntity[]; total: number; currentBalance: number }> {
    const skip = (page - 1) * limit;

    const [rawList, total, currentBalance] = await Promise.all([
      this.prisma.accountingLedger.findMany({
        where: { salonId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.accountingLedger.count({ where: { salonId } }),
      this.getSalonBalance(salonId),
    ]);

    return {
      entries: rawList.map((r) => LedgerMapper.toEntity(r)),
      total,
      currentBalance,
    };
  }

  public async getSalonBalance(salonId: string): Promise<number> {
    const latestEntry = await this.prisma.accountingLedger.findFirst({
      where: { salonId },
      orderBy: { createdAt: 'desc' },
    });

    return latestEntry ? Number(latestEntry.balanceAfter) : 0;
  }

  public async findLoyaltyAccount(
    scope: LoyaltyScope,
    userId?: string | null,
    salonCustomerId?: string | null,
    salonId?: string | null,
  ): Promise<LoyaltyAccountEntity | null> {
    const where: Prisma.LoyaltyAccountWhereInput = {
      scope,
      ...(userId ? { userId } : {}),
      ...(salonCustomerId ? { salonCustomerId } : {}),
      ...(salonId ? { salonId } : {}),
    };

    const raw = await this.prisma.loyaltyAccount.findFirst({
      where,
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!raw) return null;
    return LoyaltyMapper.toEntity(raw);
  }

  public async saveLoyaltyAccount(account: LoyaltyAccountEntity): Promise<LoyaltyAccountEntity> {
    const raw = await this.prisma.loyaltyAccount.create({
      data: {
        id: account.id,
        scope: account.scope,
        userId: account.userId,
        salonCustomerId: account.salonCustomerId,
        salonId: account.salonId,
        pointsBalance: account.pointsBalance,
        createdAt: account.transactions.length > 0 ? new Date() : undefined,
      },
      include: {
        transactions: true,
      },
    });

    return LoyaltyMapper.toEntity(raw);
  }

  public async updateLoyaltyAccount(account: LoyaltyAccountEntity): Promise<LoyaltyAccountEntity> {
    // Synchroniser le solde et ajouter les nouvelles transactions
    const raw = await this.prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le solde
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: account.pointsBalance,
          updatedAt: new Date(),
        },
      });

      // 2. Insérer les transactions non encore persistées
      for (const t of account.transactions) {
        await tx.loyaltyTransaction.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            loyaltyAccountId: account.id,
            points: t.points,
            txType: t.txType,
            description: t.description,
            referenceId: t.referenceId,
            createdAt: t.createdAt ?? new Date(),
          },
          update: {},
        });
      }

      return await tx.loyaltyAccount.findUnique({
        where: { id: account.id },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });
    });

    return LoyaltyMapper.toEntity(raw!);
  }
}
