import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories/notification.repository.interface.js';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(notification: NotificationEntity): Promise<NotificationEntity> {
    const created = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        salonId: notification.salonId,
        title: notification.title,
        body: notification.body,
        channel: notification.channel,
        isRead: notification.isRead,
        readAt: notification.readAt,
        data: (notification.data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    return this.mapToEntity(created);
  }

  public async createMany(notifications: NotificationEntity[]): Promise<NotificationEntity[]> {
    if (notifications.length === 0) return [];
    
    const results: NotificationEntity[] = [];
    for (const n of notifications) {
      const res = await this.create(n);
      results.push(res);
    }
    return results;
  }

  public async findById(id: string): Promise<NotificationEntity | null> {
    const record = await this.prisma.notification.findUnique({
      where: { id },
    });
    return record ? this.mapToEntity(record) : null;
  }

  public async findByUserId(
    userId: string,
    filters?: NotificationFilters,
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(filters?.isRead !== undefined && { isRead: filters.isRead }),
      ...(filters?.channel && { channel: filters.channel }),
      ...(filters?.salonId && { salonId: filters.salonId }),
    };

    const [total, records] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 20,
      }),
    ]);

    return {
      notifications: records.map((r) => this.mapToEntity(r)),
      total,
    };
  }

  public async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  public async markAsRead(id: string): Promise<NotificationEntity | null> {
    try {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      return this.mapToEntity(updated);
    } catch {
      return null;
    }
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.notification.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEntity(record: {
    id: string;
    userId: string;
    salonId: string | null;
    title: string;
    body: string;
    channel: any;
    isRead: boolean;
    readAt: Date | null;
    data: any;
    createdAt: Date;
  }): NotificationEntity {
    return new NotificationEntity({
      id: record.id,
      userId: record.userId,
      salonId: record.salonId,
      title: record.title,
      body: record.body,
      channel: record.channel,
      isRead: record.isRead,
      readAt: record.readAt,
      data: record.data as Record<string, unknown> | null,
      createdAt: record.createdAt,
    });
  }
}
