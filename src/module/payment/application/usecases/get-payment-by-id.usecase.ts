import { Inject, Injectable } from '@nestjs/common';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { PaymentNotFoundException } from '../../domain/exceptions/payment-domain.exception.js';

@Injectable()
export class GetPaymentByIdUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  public async execute(salonId: string, paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment || payment.salonId !== salonId) {
      throw new PaymentNotFoundException(paymentId);
    }
    return payment;
  }
}
