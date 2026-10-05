import { Injectable, Inject } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from '../../domain/repositories/notification.repository.interface.js';
import {
  GetNotificationsQueryDto,
} from '../dtos/get-notifications-query.dto.js';
import {
  PaginatedNotificationsResponseDto,
} from '../dtos/notification-response.dto.js';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  public async execute(
    userId: string,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;

    const { notifications, total } = await this.notificationRepo.findByUserId(userId, {
      isRead: query.isRead,
      channel: query.channel,
      salonId: query.salonId,
      skip,
      take,
    });

    return {
      items: notifications.map((n) => ({
        id: n.id!,
        userId: n.userId,
        salonId: n.salonId,
        title: n.title,
        body: n.body,
        channel: n.channel,
        isRead: n.isRead,
        readAt: n.readAt,
        data: n.data,
        createdAt: n.createdAt,
      })),
      total,
      skip,
      take,
    };
  }
}
