import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { ServiceModule } from '../service/service.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Tokens
import { STAFF_REPOSITORY } from './domain/repositories/staff.repository.interface.js';
import { RESOURCE_REPOSITORY } from './domain/repositories/resource.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaStaffRepository } from './infrastructure/persistence/prisma-staff.repository.js';
import { PrismaResourceRepository } from './infrastructure/persistence/prisma-resource.repository.js';

// Application Use Cases - Staff
import {
  CreateStaffUseCase,
  DeleteStaffUseCase,
  GetSalonStaffUseCase,
  GetStaffByIdUseCase,
  UpdateStaffUseCase,
} from './application/usecases/staff.usecase.js';

// Application Use Cases - Staff Services
import {
  AssignStaffServiceUseCase,
  DeleteStaffServiceUseCase,
  GetStaffServicesUseCase,
  UpdateStaffServiceUseCase,
} from './application/usecases/staff-services.usecase.js';

// Application Use Cases - Plannings, Pauses & Congés
import {
  CreateStaffBreakUseCase,
  CreateStaffTimeOffUseCase,
  DeleteStaffBreakUseCase,
  DeleteStaffTimeOffUseCase,
  GetStaffScheduleUseCase,
  UpdateStaffTimeOffStatusUseCase,
  UpdateStaffWorkingHoursUseCase,
} from './application/usecases/staff-schedule.usecase.js';

// Application Use Cases - Ressources
import {
  CreateResourceUseCase,
  DeleteResourceUseCase,
  GetResourceByIdUseCase,
  GetSalonResourcesUseCase,
  UpdateResourceUseCase,
} from './application/usecases/resource.usecase.js';

// Presentation Controllers
import { StaffController } from './presentation/controllers/staff.controller.js';
import { StaffServicesController } from './presentation/controllers/staff-services.controller.js';
import { StaffScheduleController } from './presentation/controllers/staff-schedule.controller.js';
import { ResourcesController } from './presentation/controllers/resources.controller.js';

@Module({
  imports: [PrismaModule, SalonModule, ServiceModule, AuthModule],
  controllers: [
    StaffController,
    StaffServicesController,
    StaffScheduleController,
    ResourcesController,
  ],
  providers: [
    // IoC Port -> Adapter Bindings (DDD)
    {
      provide: STAFF_REPOSITORY,
      useClass: PrismaStaffRepository,
    },
    {
      provide: RESOURCE_REPOSITORY,
      useClass: PrismaResourceRepository,
    },

    // Staff Use Cases
    CreateStaffUseCase,
    GetSalonStaffUseCase,
    GetStaffByIdUseCase,
    UpdateStaffUseCase,
    DeleteStaffUseCase,

    // Staff Services Use Cases
    AssignStaffServiceUseCase,
    GetStaffServicesUseCase,
    UpdateStaffServiceUseCase,
    DeleteStaffServiceUseCase,

    // Staff Schedule Use Cases
    GetStaffScheduleUseCase,
    UpdateStaffWorkingHoursUseCase,
    CreateStaffBreakUseCase,
    DeleteStaffBreakUseCase,
    CreateStaffTimeOffUseCase,
    UpdateStaffTimeOffStatusUseCase,
    DeleteStaffTimeOffUseCase,

    // Resource Use Cases
    CreateResourceUseCase,
    GetSalonResourcesUseCase,
    GetResourceByIdUseCase,
    UpdateResourceUseCase,
    DeleteResourceUseCase,
  ],
  exports: [
    STAFF_REPOSITORY,
    RESOURCE_REPOSITORY,
    GetStaffByIdUseCase,
    GetResourceByIdUseCase,
  ],
})
export class StaffModule {}
