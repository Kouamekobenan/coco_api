import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SALON_BILLING_REPOSITORY } from './domain/repositories/salon-billing.repository.interface.js';
import { PrismaSalonBillingRepository } from './infrastructure/persistence/prisma-salon-billing.repository.js';
import { GetSalonPlansUseCase } from './application/usecases/get-salon-plans.usecase.js';
import { GetSalonBillingStatusUseCase } from './application/usecases/get-salon-billing-status.usecase.js';
import { SubscribeSalonPlanUseCase } from './application/usecases/subscribe-salon-plan.usecase.js';
import { CheckExpiringSubscriptionsUseCase } from './application/usecases/check-expiring-subscriptions.usecase.js';
import { VerifySalonQuotasService } from './application/usecases/verify-salon-quotas.service.js';
import { SalonBillingController } from './presentation/controllers/salon-billing.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [SalonBillingController],
  providers: [
    {
      provide: SALON_BILLING_REPOSITORY,
      useClass: PrismaSalonBillingRepository,
    },
    GetSalonPlansUseCase,
    GetSalonBillingStatusUseCase,
    SubscribeSalonPlanUseCase,
    CheckExpiringSubscriptionsUseCase,
    VerifySalonQuotasService,
  ],
  exports: [
    SALON_BILLING_REPOSITORY,
    VerifySalonQuotasService,
    GetSalonBillingStatusUseCase,
  ],
})
export class SalonBillingModule {}
