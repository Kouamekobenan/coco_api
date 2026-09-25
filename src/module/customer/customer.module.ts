import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Token
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.interface.js';

// Infrastructure Persistence Adapter
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository.js';

// Application Use Cases - Clients CRM
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  FindOrCreateCustomerUseCase,
  GetCustomerByIdUseCase,
  GetSalonCustomersUseCase,
  UpdateCustomerUseCase,
} from './application/usecases/customer.usecase.js';

// Application Use Cases - Notes & Fiches Techniques
import {
  AddCustomerNoteUseCase,
  DeleteCustomerNoteUseCase,
  GetCustomerNotesUseCase,
  UpdateCustomerNoteUseCase,
} from './application/usecases/customer-notes.usecase.js';

// Presentation Controllers
import { CustomersController } from './presentation/controllers/customers.controller.js';
import { CustomerNotesController } from './presentation/controllers/customer-notes.controller.js';

@Module({
  imports: [PrismaModule, SalonModule, AuthModule],
  controllers: [CustomersController, CustomerNotesController],
  providers: [
    // IoC Port -> Adapter Binding (DDD)
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },

    // Customer Use Cases
    CreateCustomerUseCase,
    FindOrCreateCustomerUseCase,
    GetSalonCustomersUseCase,
    GetCustomerByIdUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,

    // Notes Use Cases
    AddCustomerNoteUseCase,
    GetCustomerNotesUseCase,
    UpdateCustomerNoteUseCase,
    DeleteCustomerNoteUseCase,
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    FindOrCreateCustomerUseCase,
    GetCustomerByIdUseCase,
  ],
})
export class CustomerModule {}
