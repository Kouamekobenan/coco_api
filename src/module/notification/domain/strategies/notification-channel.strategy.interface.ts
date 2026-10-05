import { NotificationChannel } from '@prisma/client';

export interface NotificationPayload {
  userId: string;
  salonId?: string | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  recipientPhone?: string; // Utilisé pour SMS et WhatsApp
  pushTokens?: string[]; // Utilisé pour FCM
}

export interface NotificationSendResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationChannelStrategy {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationSendResult>;
}

export const NOTIFICATION_STRATEGIES = Symbol('NOTIFICATION_STRATEGIES');
