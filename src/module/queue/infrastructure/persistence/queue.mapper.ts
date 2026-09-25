import { QueueTicket as PrismaQueueTicket, Prisma } from '@prisma/client';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { TicketNumber } from '../../domain/value-objects/ticket-number.vo.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';

export class QueueMapper {
  public static toEntity(raw: PrismaQueueTicket): QueueTicketEntity {
    const estimate = new QueueWaitEstimate(
      raw.estimatedWaitMin,
      raw.estimatedWaitMax,
      raw.projectedStart,
    );

    return new QueueTicketEntity({
      id: raw.id,
      salonId: raw.salonId,
      customerId: raw.customerId,
      bookingId: raw.bookingId,
      queueType: raw.queueType,
      ticketNumber: new TicketNumber(raw.ticketNumber),
      status: raw.status,
      estimate,
      calledAt: raw.calledAt,
      callDeadlineAt: raw.callDeadlineAt,
      servedAt: raw.servedAt,
      completedAt: raw.completedAt,
      qrCodeToken: raw.qrCodeToken,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(entity: QueueTicketEntity): Prisma.QueueTicketCreateInput {
    return {
      id: entity.id,
      queueType: entity.queueType,
      ticketNumber: entity.ticketNumber.value,
      status: entity.status,
      estimatedWaitMin: entity.estimate.minMinutes,
      estimatedWaitMax: entity.estimate.maxMinutes,
      projectedStart: entity.estimate.projectedStart,
      calledAt: entity.calledAt,
      callDeadlineAt: entity.callDeadlineAt,
      servedAt: entity.servedAt,
      completedAt: entity.completedAt,
      qrCodeToken: entity.qrCodeToken,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      salon: {
        connect: { id: entity.salonId },
      },
      customer: {
        connect: { id: entity.customerId },
      },
      ...(entity.bookingId ? { booking: { connect: { id: entity.bookingId } } } : {}),
    };
  }

  public static toPrismaUpdate(entity: QueueTicketEntity): Prisma.QueueTicketUpdateInput {
    return {
      status: entity.status,
      estimatedWaitMin: entity.estimate.minMinutes,
      estimatedWaitMax: entity.estimate.maxMinutes,
      projectedStart: entity.estimate.projectedStart,
      calledAt: entity.calledAt,
      callDeadlineAt: entity.callDeadlineAt,
      servedAt: entity.servedAt,
      completedAt: entity.completedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
