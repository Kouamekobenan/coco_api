import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/queue/queue.constants.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository.interface.js';
import { NOTIFICATION_PREFERENCE_REPOSITORY } from './domain/repositories/notification-preference.repository.interface.js';
import {
  NOTIFICATION_STRATEGIES,
  INotificationChannelStrategy,
} from './domain/strategies/notification-channel.strategy.interface.js';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository.js';
import { PrismaNotificationPreferenceRepository } from './infrastructure/persistence/prisma-notification-preference.repository.js';
import { InAppStrategy } from './infrastructure/strategies/in-app.strategy.js';
import { FcmPushStrategy } from './infrastructure/strategies/fcm-push.strategy.js';
import { WhatsAppStrategy } from './infrastructure/strategies/whatsapp.strategy.js';
import { TermiiSmsStrategy } from './infrastructure/strategies/termii-sms.strategy.js';
import { NotificationWorker } from './infrastructure/workers/notification.worker.js';
import { NotificationEventListener } from './infrastructure/listeners/notification-event.listener.js';
import { SendNotificationUseCase } from './application/usecases/send-notification.usecase.js';
import { GetUserNotificationsUseCase } from './application/usecases/get-user-notifications.usecase.js';
import { MarkNotificationReadUseCase } from './application/usecases/mark-notification-read.usecase.js';
import { MarkAllNotificationsReadUseCase } from './application/usecases/mark-all-notifications-read.usecase.js';
import { GetUnreadCountUseCase } from './application/usecases/get-unread-count.usecase.js';
import { ManagePreferencesUseCase } from './application/usecases/manage-preferences.usecase.js';
import { NotificationController } from './presentation/controllers/notification.controller.js';
import { NotificationPreferencesController } from './presentation/controllers/notification-preferences.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.NOTIFICATIONS,
    }),
  ],
  controllers: [
    NotificationController,
    NotificationPreferencesController,
  ],
  providers: [
    // Repositories
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: NOTIFICATION_PREFERENCE_REPOSITORY,
      useClass: PrismaNotificationPreferenceRepository,
    },

    // Strategies
    InAppStrategy,
    FcmPushStrategy,
    WhatsAppStrategy,
    TermiiSmsStrategy,
    {
      provide: NOTIFICATION_STRATEGIES,
      useFactory: (
        inApp: InAppStrategy,
        fcm: FcmPushStrategy,
        wa: WhatsAppStrategy,
        sms: TermiiSmsStrategy,
      ): INotificationChannelStrategy[] => [inApp, fcm, wa, sms],
      inject: [InAppStrategy, FcmPushStrategy, WhatsAppStrategy, TermiiSmsStrategy],
    },

    // Use cases
    SendNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    GetUnreadCountUseCase,
    ManagePreferencesUseCase,

    // Workers & Listeners
    NotificationWorker,
    NotificationEventListener,
  ],
  exports: [
    SendNotificationUseCase,
    NOTIFICATION_REPOSITORY,
    NOTIFICATION_PREFERENCE_REPOSITORY,
  ],
})
export class NotificationModule {}
