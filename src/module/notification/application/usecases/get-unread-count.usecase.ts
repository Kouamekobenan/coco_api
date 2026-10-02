import { Injectable, Inject } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from '../../domain/repositories/notification.repository.interface.js';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  public async execute(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepo.countUnread(userId);
    return { unreadCount };
  }
}
