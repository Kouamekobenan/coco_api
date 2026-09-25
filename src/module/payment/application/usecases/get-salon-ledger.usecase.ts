import { Inject, Injectable } from '@nestjs/common';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SalonLedgerResponseDto } from '../dtos/payment-response.dto.js';
import { PaymentDtoMapper } from '../dtos/payment-dto.mapper.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class GetSalonLedgerUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    page = 1,
    limit = 20,
  ): Promise<SalonLedgerResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const { entries, total, currentBalance } = await this.paymentRepo.findLedgerBySalonId(
      salonId,
      page,
      limit,
    );

    return {
      currentEscrowBalance: currentBalance,
      entries: entries.map((e) => PaymentDtoMapper.toLedgerResponse(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
