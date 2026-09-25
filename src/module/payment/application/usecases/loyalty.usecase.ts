import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LoyaltyScope } from '@prisma/client';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface.js';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { LoyaltyAccountEntity } from '../../domain/entities/loyalty-account.entity.js';
import { RedeemLoyaltyPointsDto } from '../dtos/redeem-loyalty.dto.js';
import { LoyaltyAccountResponseDto } from '../dtos/payment-response.dto.js';
import { PaymentDtoMapper } from '../dtos/payment-dto.mapper.js';
import { SalonCustomerNotFoundException } from '../../../customer/domain/exceptions/customer-domain.exception.js';
import { InsufficientLoyaltyPointsException } from '../../domain/exceptions/payment-domain.exception.js';

@Injectable()
export class LoyaltyUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  public async getCustomerLoyalty(
    salonId: string,
    customerId: string,
  ): Promise<LoyaltyAccountResponseDto> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    let account = await this.paymentRepo.findLoyaltyAccount(
      LoyaltyScope.SALON,
      null,
      customerId,
      salonId,
    );

    if (!account) {
      account = new LoyaltyAccountEntity({
        id: randomUUID(),
        scope: LoyaltyScope.SALON,
        salonCustomerId: customerId,
        salonId,
        pointsBalance: 0,
      });
      account = await this.paymentRepo.saveLoyaltyAccount(account);
    }

    return PaymentDtoMapper.toLoyaltyResponse(account);
  }

  public async redeemPoints(
    salonId: string,
    dto: RedeemLoyaltyPointsDto,
  ): Promise<LoyaltyAccountResponseDto> {
    const account = await this.paymentRepo.findLoyaltyAccount(
      dto.scope,
      dto.userId,
      dto.salonCustomerId,
      salonId,
    );

    if (!account) {
      throw new InsufficientLoyaltyPointsException(0, dto.points);
    }

    account.redeemPoints(dto.points, dto.description);
    const updated = await this.paymentRepo.updateLoyaltyAccount(account);
    return PaymentDtoMapper.toLoyaltyResponse(updated);
  }
}
