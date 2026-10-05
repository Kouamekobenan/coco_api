import { Injectable } from '@nestjs/common';
import { NotificationPreference } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  INotificationPreferenceRepository,
  UpdatePreferencesInput,
} from '../../domain/repositories/notification-preference.repository.interface.js';

@Injectable()
export class PrismaNotificationPreferenceRepository
  implements INotificationPreferenceRepository
{
  constructor(private readonly prisma: PrismaService) {}

  public async findByUserId(userId: string): Promise<NotificationPreference | null> {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  public async upsert(
    userId: string,
    data: UpdatePreferencesInput,
  ): Promise<NotificationPreference> {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled: data.pushEnabled ?? true,
        smsEnabled: data.smsEnabled ?? true,
        inAppEnabled: data.inAppEnabled ?? true,
        whatsappEnabled: data.whatsappEnabled ?? true,
      },
      update: {
        ...(data.pushEnabled !== undefined && { pushEnabled: data.pushEnabled }),
        ...(data.smsEnabled !== undefined && { smsEnabled: data.smsEnabled }),
        ...(data.inAppEnabled !== undefined && { inAppEnabled: data.inAppEnabled }),
        ...(data.whatsappEnabled !== undefined && { whatsappEnabled: data.whatsappEnabled }),
      },
    });
  }
}
