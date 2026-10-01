import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { BookingModule } from '../booking/booking.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { QUEUE_NAMES } from '../../common/queue/queue.constants.js';

// Domain Tokens
import { QUEUE_REPOSITORY } from './domain/repositories/queue.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaQueueRepository } from './infrastructure/persistence/prisma-queue.repository.js';

// Infrastructure Workers & Event Listeners
import { QueueLifecycleEventListener } from './infrastructure/listeners/queue-lifecycle-event.listener.js';
import { QueueLifecycleWorker } from './infrastructure/workers/queue-lifecycle.worker.js';
import { QueueRealtimeEventListener } from './infrastructure/listeners/queue-realtime-event.listener.js';

// Application Use Cases
import { CreateTicketUseCase } from './application/usecases/create-ticket.usecase.js';
import { GetTicketUseCase } from './application/usecases/get-ticket.usecase.js';
import { GetLiveQueueDashboardUseCase } from './application/usecases/get-live-queue-dashboard.usecase.js';
import { QueueLifecycleUseCase } from './application/usecases/queue-lifecycle.usecase.js';
import { SearchQueueTicketsUseCase } from './application/usecases/search-queue-tickets.usecase.js';
import { UpdateWaitEstimateUseCase } from './application/usecases/update-wait-estimate.usecase.js';
import { GenerateTicketPdfUseCase } from './application/usecases/generate-ticket-pdf.usecase.js';

// Presentation Gateways & Controllers
import { QueueGateway } from './presentation/gateways/queue.gateway.js';
import { QueueController } from './presentation/controllers/queue.controller.js';
import { PublicQueueController } from './presentation/controllers/public-queue.controller.js';

@Module({
  imports: [
    PrismaModule,
    SalonModule,
    CustomerModule,
    BookingModule,
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.QUEUE_LIFECYCLE,
    }),
  ],
  controllers: [QueueController, PublicQueueController],
  providers: [
    // IoC Port -> Adapter Binding (DDD)
    {
      provide: QUEUE_REPOSITORY,
      useClass: PrismaQueueRepository,
    },

    // BullMQ Worker & Event Listeners
    QueueLifecycleEventListener,
    QueueLifecycleWorker,
    QueueRealtimeEventListener,

    // WebSocket Gateway (Temps Réel)
    QueueGateway,

    // Use Cases
    CreateTicketUseCase,
    GetTicketUseCase,
    GetLiveQueueDashboardUseCase,
    QueueLifecycleUseCase,
    SearchQueueTicketsUseCase,
    UpdateWaitEstimateUseCase,
    GenerateTicketPdfUseCase,
  ],
  exports: [
    QUEUE_REPOSITORY,
    QueueGateway,
    CreateTicketUseCase,
    GetLiveQueueDashboardUseCase,
    GenerateTicketPdfUseCase,
  ],
})
export class QueueModule {}
