import { Inject, Injectable } from '@nestjs/common';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { QueueQueryDto } from '../dtos/queue-query.dto.js';
import { QueueTicketListResponseDto } from '../dtos/queue-ticket-response.dto.js';
import { QueueDtoMapper } from '../dtos/queue-dto.mapper.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class SearchQueueTicketsUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    query: QueueQueryDto,
  ): Promise<QueueTicketListResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { tickets, total } = await this.queueRepo.findBySalonId(salonId, {
      status: query.status,
      queueType: query.queueType,
      customerId: query.customerId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      skip,
      take: limit,
    });

    return {
      items: tickets.map((t) => QueueDtoMapper.toResponseDto(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
