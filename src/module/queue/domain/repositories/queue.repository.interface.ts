import { QueueTicketStatus, QueueType } from '@prisma/client';
import { QueueTicketEntity } from '../entities/queue-ticket.entity.js';
import { TicketNumber } from '../value-objects/ticket-number.vo.js';

export interface QueueFilters {
  status?: QueueTicketStatus;
  queueType?: QueueType;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  skip?: number;
  take?: number;
}

export interface IQueueRepository {
  findById(id: string): Promise<QueueTicketEntity | null>;
  findByQrCodeToken(token: string): Promise<QueueTicketEntity | null>;
  findByBookingId(bookingId: string): Promise<QueueTicketEntity | null>;
  findActiveByCustomer(salonId: string, customerId: string): Promise<QueueTicketEntity | null>;
  findActiveQueue(salonId: string): Promise<QueueTicketEntity[]>;
  findBySalonId(
    salonId: string,
    filters?: QueueFilters,
  ): Promise<{ tickets: QueueTicketEntity[]; total: number }>;
  getNextTicketNumber(salonId: string, queueType: QueueType, date: Date): Promise<TicketNumber>;
  save(ticket: QueueTicketEntity): Promise<QueueTicketEntity>;
  update(ticket: QueueTicketEntity): Promise<QueueTicketEntity>;
  countWaitingBefore(salonId: string, createdAt: Date): Promise<number>;
}

export const QUEUE_REPOSITORY = Symbol('QUEUE_REPOSITORY');
