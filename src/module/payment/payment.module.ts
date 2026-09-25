import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { BookingModule } from '../booking/booking.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Tokens
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaPaymentRepository } from './infrastructure/persistence/prisma-payment.repository.js';

// Application Use Cases
import { InitiatePaymentUseCase } from './application/usecases/initiate-payment.usecase.js';
import { ProcessPaymentWebhookUseCase } from './application/usecases/process-payment-webhook.usecase.js';
import { GetPaymentByIdUseCase } from './application/usecases/get-payment-by-id.usecase.js';
import { SearchPaymentsUseCase } from './application/usecases/search-payments.usecase.js';
import { RefundPaymentUseCase } from './application/usecases/refund-payment.usecase.js';
import { GetSalonLedgerUseCase } from './application/usecases/get-salon-ledger.usecase.js';
import { LoyaltyUseCase } from './application/usecases/loyalty.usecase.js';

// Presentation Controllers
import { PaymentsController } from './presentation/controllers/payments.controller.js';
import { LedgerController } from './presentation/controllers/ledger.controller.js';
import { LoyaltyController } from './presentation/controllers/loyalty.controller.js';
import { WebhooksController } from './presentation/controllers/webhooks.controller.js';

@Module({
  imports: [
    PrismaModule,
    SalonModule,
    BookingModule,
    CustomerModule,
    AuthModule,
  ],
  controllers: [
    PaymentsController,
    LedgerController,
    LoyaltyController,
    WebhooksController,
  ],
  providers: [
    // IoC Port -> Adapter Binding (DDD)
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },

    // Use Cases
    InitiatePaymentUseCase,
    ProcessPaymentWebhookUseCase,
    GetPaymentByIdUseCase,
    SearchPaymentsUseCase,
    RefundPaymentUseCase,
    GetSalonLedgerUseCase,
    LoyaltyUseCase,
  ],
  exports: [
    PAYMENT_REPOSITORY,
    InitiatePaymentUseCase,
    GetSalonLedgerUseCase,
    LoyaltyUseCase,
  ],
})
export class PaymentModule {}
