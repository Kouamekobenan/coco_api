import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LedgerEntryType, LoyaltyScope, PaymentProvider, PaymentType } from '@prisma/client';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { LoyaltyAccountEntity } from '../../domain/entities/loyalty-account.entity.js';
import { WebhookPayloadDto } from '../dtos/webhook-payload.dto.js';
import { PaymentNotFoundException } from '../../domain/exceptions/payment-domain.exception.js';

@Injectable()
export class ProcessPaymentWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
  ) {}

  public async execute(
    provider: PaymentProvider,
    payload: WebhookPayloadDto,
    rawBody?: any,
  ): Promise<void> {
    // Retrouver le paiement via la clé d'idempotence ou référence de transaction
    let payment = null;
    if (payload.idempotencyKey) {
      payment = await this.paymentRepo.findByIdempotencyKey(payload.idempotencyKey);
    }
    if (!payment && payload.transactionId) {
      payment = await this.paymentRepo.findByProviderTxId(payload.transactionId);
    }

    if (!payment) {
      throw new PaymentNotFoundException(
        payload.idempotencyKey ?? payload.transactionId ?? 'UNKNOWN_TX',
      );
    }

    if (payment.isSettled()) {
      return; // Déjà encaissé (sécurité replay attacks)
    }

    const isSuccess =
      payload.status === 'SUCCESSFUL' ||
      payload.status === 'SUCCEEDED' ||
      payload.status === 'SUCCESS' ||
      payload.status === 'completed';

    if (isSuccess) {
      const txId = payload.transactionId ?? `TX-${randomUUID().substring(0, 8).toUpperCase()}`;
      payment.markSuccess(txId, new Date(), rawBody ?? payload);
      await this.paymentRepo.update(payment);

      // 1. Validation de l'acompte sur le Booking
      const booking = await this.bookingRepo.findById(payment.bookingId);
      if (booking) {
        if (payment.type === PaymentType.DEPOSIT && !booking.isDepositPaid) {
          booking.confirmDeposit(new Date());
          await this.bookingRepo.update(booking);
        }
      }

      // 2. Inscription au Grand Livre Comptable (Escrow Ledger)
      const currentBalance = await this.paymentRepo.getSalonBalance(payment.salonId);

      // Entrée Crédit Séquestre (Montant brut reçu)
      const creditEntry = new LedgerEntryEntity({
        id: randomUUID(),
        salonId: payment.salonId,
        paymentId: payment.id,
        entryType: LedgerEntryType.DEPOSIT_CREDIT,
        amount: payment.amount,
        balanceAfter: currentBalance + payment.amount,
        description: `Crédit Mobile Money ${provider} pour RDV (${payment.type})`,
      });
      await this.paymentRepo.saveLedgerEntry(creditEntry);

      // Entrée Débit Commission Plateforme (si applicable)
      if (payment.commissionAmount > 0) {
        const commissionEntry = new LedgerEntryEntity({
          id: randomUUID(),
          salonId: payment.salonId,
          paymentId: payment.id,
          entryType: LedgerEntryType.COMMISSION_DEBIT,
          amount: -payment.commissionAmount,
          balanceAfter: currentBalance + payment.amount - payment.commissionAmount,
          description: `Commission Coco (${payment.commissionAmount} FCFA)`,
        });
        await this.paymentRepo.saveLedgerEntry(commissionEntry);
      }

      // 3. Attribution des points de fidélité (1 point par tranche de 100 FCFA)
      if (booking) {
        const pointsEarned = Math.floor(payment.amount / 100);
        if (pointsEarned > 0) {
          let loyaltyAccount = await this.paymentRepo.findLoyaltyAccount(
            LoyaltyScope.SALON,
            null,
            booking.customerId,
            payment.salonId,
          );

          if (!loyaltyAccount) {
            loyaltyAccount = new LoyaltyAccountEntity({
              id: randomUUID(),
              scope: LoyaltyScope.SALON,
              salonCustomerId: booking.customerId,
              salonId: payment.salonId,
              pointsBalance: 0,
            });
            loyaltyAccount = await this.paymentRepo.saveLoyaltyAccount(loyaltyAccount);
          }

          loyaltyAccount.earnPoints(
            pointsEarned,
            `Paiement effectué pour RDV ${booking.id}`,
            booking.id,
          );
          await this.paymentRepo.updateLoyaltyAccount(loyaltyAccount);
        }
      }
    } else {
      payment.markFailed(rawBody ?? payload);
      await this.paymentRepo.update(payment);
    }
  }
}
