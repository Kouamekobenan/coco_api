import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Token & Persistence Adapter
import { SALON_SUBSCRIPTION_REPOSITORY } from './domain/repositories/salon-subscription.repository.interface.js';
import { PrismaSalonSubscriptionRepository } from './infrastructure/persistence/prisma-salon-subscription.repository.js';

// Application Use Cases
import { SubscribeSalonUseCase } from './application/usecases/subscribe-salon.usecase.js';
import { UnsubscribeSalonUseCase } from './application/usecases/unsubscribe-salon.usecase.js';
import { GetSubscriptionStatusUseCase } from './application/usecases/get-subscription-status.usecase.js';
import { GetUserSubscriptionsUseCase } from './application/usecases/get-user-subscriptions.usecase.js';
import { GetSalonSubscribersUseCase } from './application/usecases/get-salon-subscribers.usecase.js';
import { UpdateSubscriptionPreferencesUseCase } from './application/usecases/update-subscription-preferences.usecase.js';

// Presentation Controllers
import { SalonSubscriptionsController } from './presentation/controllers/salon-subscriptions.controller.js';
import { UserSubscriptionsController } from './presentation/controllers/user-subscriptions.controller.js';

@Module({
  imports: [PrismaModule, SalonModule, AuthModule],
  controllers: [SalonSubscriptionsController, UserSubscriptionsController],
  providers: [
    {
      provide: SALON_SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSalonSubscriptionRepository,
    },
    SubscribeSalonUseCase,
    UnsubscribeSalonUseCase,
    GetSubscriptionStatusUseCase,
    GetUserSubscriptionsUseCase,
    GetSalonSubscribersUseCase,
    UpdateSubscriptionPreferencesUseCase,
  ],
  exports: [
    SALON_SUBSCRIPTION_REPOSITORY,
    SubscribeSalonUseCase,
    UnsubscribeSalonUseCase,
    GetSubscriptionStatusUseCase,
    GetUserSubscriptionsUseCase,
    GetSalonSubscribersUseCase,
  ],
})
export class SubscriptionModule {}
