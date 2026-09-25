import { Inject, Injectable } from '@nestjs/common';
import { QueueTicketStatus } from '@prisma/client';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { PublicTicketStatusResponseDto } from '../dtos/public-ticket-status-response.dto.js';
import { QueueTicketNotFoundException } from '../../domain/exceptions/queue-domain.exception.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class GetTicketUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
  ) {}

  public async getById(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.queueRepo.findById(ticketId);
    if (!ticket || ticket.salonId !== salonId) {
      throw new QueueTicketNotFoundException(ticketId);
    }
    return ticket;
  }

  public async getByQrCodeToken(qrCodeToken: string): Promise<PublicTicketStatusResponseDto> {
    const ticket = await this.queueRepo.findByQrCodeToken(qrCodeToken);
    if (!ticket) {
      throw new QueueTicketNotFoundException(qrCodeToken);
    }

    const salon = await this.salonRepo.findById(ticket.salonId);
    if (!salon) {
      throw new SalonNotFoundException(ticket.salonId);
    }

    let positionInLine = 0;
    let clientsAheadCount = 0;

    if (ticket.status === QueueTicketStatus.WAITING) {
      clientsAheadCount = await this.queueRepo.countWaitingBefore(
        ticket.salonId,
        ticket.createdAt,
      );
      positionInLine = clientsAheadCount + 1;
    }

    return {
      ticketNumber: ticket.ticketNumber.value,
      queueType: ticket.queueType,
      status: ticket.status,
      positionInLine,
      clientsAheadCount,
      estimatedWait: ticket.estimate.formattedRange,
      callDeadlineAt: ticket.callDeadlineAt ? ticket.callDeadlineAt.toISOString() : null,
      salonName: salon.getName(),
      createdAt: ticket.createdAt.toISOString(),
    };
  }
}
