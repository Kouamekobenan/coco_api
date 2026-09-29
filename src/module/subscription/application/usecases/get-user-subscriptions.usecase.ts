import { Inject, Injectable } from '@nestjs/common';
import type { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SALON_SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { SubscriptionQueryDto } from '../dtos/subscription-query.dto.js';
import { PaginatedSubscriptionsResponseDto } from '../dtos/salon-subscription-response.dto.js';
import { SubscriptionDtoMapper } from '../dtos/subscription-dto.mapper.js';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';

@Injectable()
export class GetUserSubscriptionsUseCase {
  constructor(
    @Inject(SALON_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISalonSubscriptionRepository,
  ) {}

  public async execute(
    userId: string,
    query: SubscriptionQueryDto,
  ): Promise<PaginatedSubscriptionsResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const { items, total } = await this.subscriptionRepo.findUserSubscriptions(userId, page, limit);

    const data = items.map((item) => SubscriptionDtoMapper.toResponse(item));

    return PaginatedResponseDto.create(
      data,
      total,
      page,
      limit,
    ) as PaginatedSubscriptionsResponseDto;
  }
}
