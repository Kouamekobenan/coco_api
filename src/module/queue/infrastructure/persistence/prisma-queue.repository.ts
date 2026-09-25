import { Injectable } from '@nestjs/common';
import { QueueTicketStatus, QueueType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  IQueueRepository,
  QueueFilters,
} from '../../domain/repositories/queue.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { TicketNumber } from '../../domain/value-objects/ticket-number.vo.js';
import { QueueMapper } from './queue.mapper.js';

@Injectable()
export class PrismaQueueRepository implements IQueueRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<QueueTicketEntity | null> {
    const raw = await this.prisma.queueTicket.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return QueueMapper.toEntity(raw);
  }

  public async findByQrCodeToken(token: string): Promise<QueueTicketEntity | null> {
    const raw = await this.prisma.queueTicket.findUnique({
      where: { qrCodeToken: token },
    });
    if (!raw) return null;
    return QueueMapper.toEntity(raw);
  }

  public async findByBookingId(bookingId: string): Promise<QueueTicketEntity | null> {
    const raw = await this.prisma.queueTicket.findUnique({
      where: { bookingId },
    });
    if (!raw) return null;
    return QueueMapper.toEntity(raw);
  }

  public async findActiveByCustomer(
    salonId: string,
    customerId: string,
  ): Promise<QueueTicketEntity | null> {
    const activeStatuses: QueueTicketStatus[] = [
      QueueTicketStatus.WAITING,
      QueueTicketStatus.CALLED,
      QueueTicketStatus.IN_SERVICE,
    ];

    const raw = await this.prisma.queueTicket.findFirst({
      where: {
        salonId,
        customerId,
        status: { in: activeStatuses },
      },
    });

    if (!raw) return null;
    return QueueMapper.toEntity(raw);
  }

  public async findActiveQueue(salonId: string): Promise<QueueTicketEntity[]> {
    const activeStatuses: QueueTicketStatus[] = [
      QueueTicketStatus.WAITING,
      QueueTicketStatus.CALLED,
      QueueTicketStatus.IN_SERVICE,
    ];

    const rawList = await this.prisma.queueTicket.findMany({
      where: {
        salonId,
        status: { in: activeStatuses },
      },
      orderBy: { createdAt: 'asc' },
    });

    return rawList.map((r) => QueueMapper.toEntity(r));
  }

  public async findBySalonId(
    salonId: string,
    filters?: QueueFilters,
  ): Promise<{ tickets: QueueTicketEntity[]; total: number }> {
    const where: Prisma.QueueTicketWhereInput = {
      salonId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.queueType ? { queueType: filters.queueType } : {}),
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters?.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters?.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const [rawList, total] = await Promise.all([
      this.prisma.queueTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 20,
      }),
      this.prisma.queueTicket.count({ where }),
    ]);

    return {
      tickets: rawList.map((r) => QueueMapper.toEntity(r)),
      total,
    };
  }

  public async getNextTicketNumber(
    salonId: string,
    queueType: QueueType,
    date: Date,
  ): Promise<TicketNumber> {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    const count = await this.prisma.queueTicket.count({
      where: {
        salonId,
        queueType,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    return TicketNumber.generate(queueType, count + 1);
  }

  public async save(ticket: QueueTicketEntity): Promise<QueueTicketEntity> {
    const data = QueueMapper.toPrismaCreate(ticket);
    const raw = await this.prisma.queueTicket.create({
      data,
    });
    return QueueMapper.toEntity(raw);
  }

  public async update(ticket: QueueTicketEntity): Promise<QueueTicketEntity> {
    const data = QueueMapper.toPrismaUpdate(ticket);
    const raw = await this.prisma.queueTicket.update({
      where: { id: ticket.id },
      data,
    });
    return QueueMapper.toEntity(raw);
  }

  public async countWaitingBefore(salonId: string, createdAt: Date): Promise<number> {
    return await this.prisma.queueTicket.count({
      where: {
        salonId,
        status: QueueTicketStatus.WAITING,
        createdAt: { lt: createdAt },
      },
    });
  }
}
