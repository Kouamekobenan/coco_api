import { NotificationChannel } from '@prisma/client';
import { NotificationEntity } from '../entities/notification.entity.js';

export interface NotificationFilters {
  isRead?: boolean;
  channel?: NotificationChannel;
  salonId?: string;
  skip?: number;
  take?: number;
}

export interface INotificationRepository {
  create(notification: NotificationEntity): Promise<NotificationEntity>;
  createMany(notifications: NotificationEntity[]): Promise<NotificationEntity[]>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByUserId(
    userId: string,
    filters?: NotificationFilters,
  ): Promise<{ notifications: NotificationEntity[]; total: number }>;
  countUnread(userId: string): Promise<number>;
  markAsRead(id: string): Promise<NotificationEntity | null>;
  markAllAsRead(userId: string): Promise<number>;
  delete(id: string): Promise<boolean>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
