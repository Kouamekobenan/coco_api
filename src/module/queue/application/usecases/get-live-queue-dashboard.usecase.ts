import { Inject, Injectable } from '@nestjs/common';
import { QueueTicketStatus } from '@prisma/client';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { LiveQueueDashboardResponseDto } from '../dtos/live-queue-dashboard-response.dto.js';
import { QueueDtoMapper } from '../dtos/queue-dto.mapper.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class GetLiveQueueDashboardUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async execute(salonId: string): Promise<LiveQueueDashboardResponseDto> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const activeTickets = await this.queueRepo.findActiveQueue(salonId);

    const currentlyCalled = activeTickets
      .filter((t) => t.status === QueueTicketStatus.CALLED)
      .map((t) => QueueDtoMapper.toResponseDto(t));

    const currentlyInService = activeTickets
      .filter((t) => t.status === QueueTicketStatus.IN_SERVICE)
      .map((t) => QueueDtoMapper.toResponseDto(t));

    const waitingQueue = activeTickets
      .filter((t) => t.status === QueueTicketStatus.WAITING)
      .map((t) => QueueDtoMapper.toResponseDto(t));

    // Calcul de l'attente moyenne pour un nouvel arrivant
    const estimatedAverageWaitMin = waitingQueue.length > 0
      ? Math.round(
          waitingQueue.reduce((acc, t) => acc + (t.estimatedWaitMin + t.estimatedWaitMax) / 2, 0) /
            waitingQueue.length,
        )
      : 0;

    return {
      salonId,
      waitingCount: waitingQueue.length,
      calledCount: currentlyCalled.length,
      inServiceCount: currentlyInService.length,
      estimatedAverageWaitMin,
      currentlyCalled,
      currentlyInService,
      waitingQueue,
    };
  }
}
