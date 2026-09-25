import { Inject, Injectable } from '@nestjs/common';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { PaymentQueryDto } from '../dtos/payment-query.dto.js';
import { PaymentListResponseDto } from '../dtos/payment-response.dto.js';
import { PaymentDtoMapper } from '../dtos/payment-dto.mapper.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class SearchPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    query: PaymentQueryDto,
  ): Promise<PaymentListResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { payments, total } = await this.paymentRepo.findBySalonId(salonId, {
      status: query.status,
      provider: query.provider,
      type: query.type,
      bookingId: query.bookingId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      skip,
      take: limit,
    });

    return {
      items: payments.map((p) => PaymentDtoMapper.toPaymentResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
