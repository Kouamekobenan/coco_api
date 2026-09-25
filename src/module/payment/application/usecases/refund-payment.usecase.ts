import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LedgerEntryType } from '@prisma/client';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import { RefundEntity } from '../../domain/entities/refund.entity.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { RefundPaymentDto } from '../dtos/refund-payment.dto.js';
import {
  PaymentNotFoundException,
  InvalidPaymentAmountException,
} from '../../domain/exceptions/payment-domain.exception.js';

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  public async execute(
    salonId: string,
    paymentId: string,
    dto: RefundPaymentDto,
  ): Promise<RefundEntity> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment || payment.salonId !== salonId) {
      throw new PaymentNotFoundException(paymentId);
    }

    const refundAmount = dto.amount ?? payment.amount;
    if (refundAmount > payment.amount) {
      throw new InvalidPaymentAmountException(
        `Le montant du remboursement (${refundAmount} FCFA) ne peut pas dépasser le montant du paiement d'origine (${payment.amount} FCFA).`,
      );
    }

    // Marquer le paiement comme remboursé si remboursement total
    if (refundAmount === payment.amount) {
      payment.markRefunded();
      await this.paymentRepo.update(payment);
    }

    // Créer l'entité de remboursement
    const refund = new RefundEntity({
      id: randomUUID(),
      paymentId,
      amount: refundAmount,
      reason: dto.reason ?? 'Remboursement autorisé par le salon',
      providerRefundId: `REF-${randomUUID().substring(0, 8).toUpperCase()}`,
      status: 'SUCCEEDED',
    });
    const savedRefund = await this.paymentRepo.saveRefund(refund);

    // Mouvement au grand livre comptable (Débit remboursement)
    const currentBalance = await this.paymentRepo.getSalonBalance(salonId);
    const ledgerEntry = new LedgerEntryEntity({
      id: randomUUID(),
      salonId,
      paymentId,
      entryType: LedgerEntryType.REFUND_DEBIT,
      amount: -refundAmount,
      balanceAfter: currentBalance - refundAmount,
      description: `Remboursement client: ${refund.reason}`,
    });
    await this.paymentRepo.saveLedgerEntry(ledgerEntry);

    return savedRefund;
  }
}
