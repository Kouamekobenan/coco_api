import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { QueueTicketResponseDto } from './queue-ticket-response.dto.js';

export class QueueDtoMapper {
  public static toResponseDto(ticket: QueueTicketEntity): QueueTicketResponseDto {
    return {
      id: ticket.id,
      salonId: ticket.salonId,
      customerId: ticket.customerId,
      bookingId: ticket.bookingId,
      queueType: ticket.queueType,
      ticketNumber: ticket.ticketNumber.value,
      status: ticket.status,
      estimatedWaitMin: ticket.estimate.minMinutes,
      estimatedWaitMax: ticket.estimate.maxMinutes,
      formattedWait: ticket.estimate.formattedRange,
      projectedStart: ticket.estimate.projectedStart
        ? ticket.estimate.projectedStart.toISOString()
        : null,
      calledAt: ticket.calledAt ? ticket.calledAt.toISOString() : null,
      callDeadlineAt: ticket.callDeadlineAt ? ticket.callDeadlineAt.toISOString() : null,
      servedAt: ticket.servedAt ? ticket.servedAt.toISOString() : null,
      completedAt: ticket.completedAt ? ticket.completedAt.toISOString() : null,
      qrCodeToken: ticket.qrCodeToken,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }
}
