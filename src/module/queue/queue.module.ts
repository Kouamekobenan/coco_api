import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { BookingModule } from '../booking/booking.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Tokens
import { QUEUE_REPOSITORY } from './domain/repositories/queue.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaQueueRepository } from './infrastructure/persistence/prisma-queue.repository.js';

// Application Use Cases
import { CreateTicketUseCase } from './application/usecases/create-ticket.usecase.js';
import { GetTicketUseCase } from './application/usecases/get-ticket.usecase.js';
import { GetLiveQueueDashboardUseCase } from './application/usecases/get-live-queue-dashboard.usecase.js';
import { QueueLifecycleUseCase } from './application/usecases/queue-lifecycle.usecase.js';
import { SearchQueueTicketsUseCase } from './application/usecases/search-queue-tickets.usecase.js';
import { UpdateWaitEstimateUseCase } from './application/usecases/update-wait-estimate.usecase.js';

// Presentation Controllers
import { QueueController } from './presentation/controllers/queue.controller.js';
import { PublicQueueController } from './presentation/controllers/public-queue.controller.js';

@Module({
  imports: [
    PrismaModule,
    SalonModule,
    CustomerModule,
    BookingModule,
    AuthModule,
  ],
  controllers: [QueueController, PublicQueueController],
  providers: [
    // IoC Port -> Adapter Binding (DDD)
    {
      provide: QUEUE_REPOSITORY,
      useClass: PrismaQueueRepository,
    },

    // Use Cases
    CreateTicketUseCase,
    GetTicketUseCase,
    GetLiveQueueDashboardUseCase,
    QueueLifecycleUseCase,
    SearchQueueTicketsUseCase,
    UpdateWaitEstimateUseCase,
  ],
  exports: [
    QUEUE_REPOSITORY,
    CreateTicketUseCase,
    GetLiveQueueDashboardUseCase,
  ],
})
export class QueueModule {}
