import { Inject, Injectable } from '@nestjs/common';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { SubscriptionQueryDto } from '../dtos/subscription-query.dto.js';
import { PaginatedSubscribersResponseDto } from '../dtos/salon-subscription-response.dto.js';
import { SubscriptionDtoMapper } from '../dtos/subscription-dto.mapper.js';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';

@Injectable()
export class GetSalonSubscribersUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    query: SubscriptionQueryDto,
  ): Promise<PaginatedSubscribersResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const { items, total } = await this.subscriptionRepo.findSalonSubscribers(salonId, page, limit);

    const data = items.map((item) => SubscriptionDtoMapper.toResponse(item));

    return PaginatedResponseDto.create(
      data,
      total,
      page,
      limit,
    ) as PaginatedSubscribersResponseDto;
  }
}
