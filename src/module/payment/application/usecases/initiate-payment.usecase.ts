import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LedgerEntryType, PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../../booking/domain/repositories/booking.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { LedgerEntryEntity } from '../../domain/entities/ledger-entry.entity.js';
import { PaymentAmount } from '../../domain/value-objects/payment-amount.vo.js';
import { InitiatePaymentDto } from '../dtos/initiate-payment.dto.js';
import { BookingNotFoundException } from '../../../booking/domain/exceptions/booking-domain.exception.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

export interface InitiatePaymentResult {
  payment: PaymentEntity;
  checkoutUrl?: string | null;
}

@Injectable()
export class InitiatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: InitiatePaymentDto,
  ): Promise<InitiatePaymentResult> {
    // 1. Idempotency Check
    const existing = await this.paymentRepo.findByIdempotencyKey(dto.idempotencyKey);
    if (existing) {
      return { payment: existing };
    }

    // 2. Salon & Booking checks
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const booking = await this.bookingRepo.findById(dto.bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(dto.bookingId);
    }

    // 3. Calcul du montant
    let baseAmount = dto.amount;
    if (!baseAmount) {
      if (dto.type === PaymentType.DEPOSIT) {
        baseAmount = booking.depositAmount;
      } else if (dto.type === PaymentType.REMAINING_BALANCE) {
        baseAmount = Math.max(0, booking.totalPrice - (booking.isDepositPaid ? booking.depositAmount : 0));
      } else {
        baseAmount = booking.totalPrice;
      }
    }

    // 4. Commission Coco (ex: 5% pour paiements digitaux Mobile Money, 0% pour cash direct)
    const commissionPercent = dto.provider === PaymentProvider.CASH ? 0 : 5;
    const paymentAmount = PaymentAmount.calculateCommission(baseAmount, commissionPercent, 'XOF');

    const paymentId = randomUUID();
    let status: PaymentStatus = PaymentStatus.PENDING;
    let paidAt: Date | null = null;
    let providerTxId: string | null = null;
    let checkoutUrl: string | null = null;

    // 5. Traitement selon opérateur
    if (dto.provider === PaymentProvider.CASH) {
      status = PaymentStatus.SUCCEEDED;
      paidAt = new Date();
      providerTxId = `CASH-${randomUUID().substring(0, 8).toUpperCase()}`;

      // Si c'est un acompte en cash, confirmer la réservation
      if (dto.type === PaymentType.DEPOSIT && !booking.isDepositPaid) {
        booking.confirmDeposit(paidAt);
        await this.bookingRepo.update(booking);
      }

      // Inscription au grand livre comptable (Cash collecté au salon)
      const currentBalance = await this.paymentRepo.getSalonBalance(salonId);
      const ledgerEntry = new LedgerEntryEntity({
        id: randomUUID(),
        salonId,
        paymentId,
        entryType: LedgerEntryType.DEPOSIT_CREDIT,
        amount: paymentAmount.netSalonAmount,
        balanceAfter: currentBalance + paymentAmount.netSalonAmount,
        description: `Paiement en espèces reçu pour RDV (${dto.type})`,
      });
      await this.paymentRepo.saveLedgerEntry(ledgerEntry);
    } else {
      // Pour Wave / Orange / MTN / Moov: génération de l'URL de paiement deep-link
      const operatorSlug = dto.provider.toLowerCase();
      checkoutUrl = `https://pay.coco-beauty.ci/checkout/${operatorSlug}/${dto.idempotencyKey}?amount=${paymentAmount.amount}`;
    }

    const payment = new PaymentEntity({
      id: paymentId,
      idempotencyKey: dto.idempotencyKey,
      bookingId: dto.bookingId,
      salonId,
      provider: dto.provider,
      providerTxId,
      externalRef: checkoutUrl ? `EXT-${dto.idempotencyKey.substring(0, 8)}` : null,
      paymentAmount,
      type: dto.type,
      status,
      paidAt,
    });

    const savedPayment = await this.paymentRepo.save(payment);
    return {
      payment: savedPayment,
      checkoutUrl,
    };
  }
}
