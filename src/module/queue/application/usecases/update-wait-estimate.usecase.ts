import { Inject, Injectable } from '@nestjs/common';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';
import { UpdateWaitEstimateDto } from '../dtos/update-wait-estimate.dto.js';
import { QueueTicketNotFoundException } from '../../domain/exceptions/queue-domain.exception.js';

@Injectable()
export class UpdateWaitEstimateUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
  ) {}

  public async execute(
    salonId: string,
    ticketId: string,
    dto: UpdateWaitEstimateDto,
  ): Promise<QueueTicketEntity> {
    const ticket = await this.queueRepo.findById(ticketId);
    if (!ticket || ticket.salonId !== salonId) {
      throw new QueueTicketNotFoundException(ticketId);
    }

    const projectedStart = dto.projectedStart ? new Date(dto.projectedStart) : null;
    const estimate = new QueueWaitEstimate(
      dto.estimatedWaitMin,
      dto.estimatedWaitMax,
      projectedStart,
    );

    ticket.updateEstimate(estimate);
    return await this.queueRepo.update(ticket);
  }
}
