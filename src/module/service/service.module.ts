import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Tokens
import { SERVICE_REPOSITORY } from './domain/repositories/service.repository.interface.js';
import { STYLE_REPOSITORY } from './domain/repositories/style.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaServiceRepository } from './infrastructure/persistence/prisma-service.repository.js';
import { PrismaStyleRepository } from './infrastructure/persistence/prisma-style.repository.js';

// Application Use Cases - Styles
import {
  CreateStyleUseCase,
  DeleteStyleUseCase,
  GetStyleByIdUseCase,
  GetStyleBySlugUseCase,
  GetStylesUseCase,
  UpdateStyleUseCase,
} from './application/usecases/style.usecase.js';

// Application Use Cases - Services
import {
  CreateServiceUseCase,
  DeleteServiceUseCase,
  GetSalonServicesUseCase,
  GetServiceByIdUseCase,
  ReorderServicesUseCase,
  UpdateServiceUseCase,
} from './application/usecases/service.usecase.js';

// Application Use Cases - Variantes
import {
  CreateServiceVariantUseCase,
  DeleteServiceVariantUseCase,
  GetServiceVariantByIdUseCase,
  GetServiceVariantsUseCase,
  UpdateServiceVariantUseCase,
} from './application/usecases/service-variant.usecase.js';

// Presentation Controllers
import { StylesController } from './presentation/controllers/styles.controller.js';
import { ServicesController } from './presentation/controllers/services.controller.js';
import { ServiceVariantsController } from './presentation/controllers/service-variants.controller.js';

@Module({
  imports: [PrismaModule, SalonModule, AuthModule],
  controllers: [StylesController, ServicesController, ServiceVariantsController],
  providers: [
    // IoC Port -> Adapter Bindings (DDD)
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
    {
      provide: STYLE_REPOSITORY,
      useClass: PrismaStyleRepository,
    },

    // Style Use Cases
    CreateStyleUseCase,
    GetStylesUseCase,
    GetStyleByIdUseCase,
    GetStyleBySlugUseCase,
    UpdateStyleUseCase,
    DeleteStyleUseCase,

    // Service Use Cases
    CreateServiceUseCase,
    GetSalonServicesUseCase,
    GetServiceByIdUseCase,
    UpdateServiceUseCase,
    ReorderServicesUseCase,
    DeleteServiceUseCase,

    // Variant Use Cases
    CreateServiceVariantUseCase,
    GetServiceVariantsUseCase,
    GetServiceVariantByIdUseCase,
    UpdateServiceVariantUseCase,
    DeleteServiceVariantUseCase,
  ],
  exports: [
    SERVICE_REPOSITORY,
    STYLE_REPOSITORY,
    GetServiceByIdUseCase,
    GetServiceVariantByIdUseCase,
  ],
})
export class ServiceModule {}
