import { NotificationPreference } from '@prisma/client';

export interface UpdatePreferencesInput {
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  whatsappEnabled?: boolean;
}

export interface INotificationPreferenceRepository {
  findByUserId(userId: string): Promise<NotificationPreference | null>;
  upsert(userId: string, data: UpdatePreferencesInput): Promise<NotificationPreference>;
}

export const NOTIFICATION_PREFERENCE_REPOSITORY = Symbol(
  'NOTIFICATION_PREFERENCE_REPOSITORY',
);
