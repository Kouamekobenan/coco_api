import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from '../../domain/repositories/notification.repository.interface.js';
import { NotificationResponseDto } from '../dtos/notification-response.dto.js';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  public async execute(id: string, userId: string): Promise<NotificationResponseDto> {
    const existing = await this.notificationRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification avec l'ID ${id} introuvable.`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette notification.');
    }

    const updated = await this.notificationRepo.markAsRead(id);
    if (!updated) {
      throw new NotFoundException(`Notification introuvable.`);
    }

    return {
      id: updated.id!,
      userId: updated.userId,
      salonId: updated.salonId,
      title: updated.title,
      body: updated.body,
      channel: updated.channel,
      isRead: updated.isRead,
      readAt: updated.readAt,
      data: updated.data,
      createdAt: updated.createdAt,
    };
  }
}
