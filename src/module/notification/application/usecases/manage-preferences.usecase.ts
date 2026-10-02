import { Injectable, Inject } from '@nestjs/common';
import { NotificationPreference } from '@prisma/client';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  type INotificationPreferenceRepository,
} from '../../domain/repositories/notification-preference.repository.interface.js';
import { UpdateNotificationPreferencesDto } from '../dtos/update-notification-preferences.dto.js';

@Injectable()
export class ManagePreferencesUseCase {
  constructor(
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferenceRepo: INotificationPreferenceRepository,
  ) {}

  public async getPreferences(userId: string): Promise<NotificationPreference> {
    const prefs = await this.preferenceRepo.findByUserId(userId);
    if (!prefs) {
      // Préférences par défaut
      return this.preferenceRepo.upsert(userId, {
        pushEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        whatsappEnabled: true,
      });
    }
    return prefs;
  }

  public async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    return this.preferenceRepo.upsert(userId, dto);
  }
}
