import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SalonModule } from '../salon/salon.module.js';
import { ServiceModule } from '../service/service.module.js';
import { StaffModule } from '../staff/staff.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Tokens
import { BOOKING_REPOSITORY } from './domain/repositories/booking.repository.interface.js';

// Infrastructure Persistence Adapters
import { PrismaBookingRepository } from './infrastructure/persistence/prisma-booking.repository.js';

// Application Use Cases
import { CreateBookingUseCase } from './application/usecases/create-booking.usecase.js';
import { GetAvailableSlotsUseCase } from './application/usecases/get-available-slots.usecase.js';
import { GetBookingByIdUseCase } from './application/usecases/get-booking-by-id.usecase.js';
import { SearchBookingsUseCase } from './application/usecases/search-bookings.usecase.js';
import { BookingLifecycleUseCase } from './application/usecases/booking-lifecycle.usecase.js';
import { BookingPhasesUseCase } from './application/usecases/booking-phases.usecase.js';

// Presentation Controllers
import { BookingsController } from './presentation/controllers/bookings.controller.js';
import { BookingPhasesController } from './presentation/controllers/booking-phases.controller.js';

@Module({
  imports: [
    PrismaModule,
    SalonModule,
    ServiceModule,
    StaffModule,
    CustomerModule,
    AuthModule,
  ],
  controllers: [BookingsController, BookingPhasesController],
  providers: [
    // IoC Port -> Adapter Binding (DDD)
    {
      provide: BOOKING_REPOSITORY,
      useClass: PrismaBookingRepository,
    },

    // Use Cases
    CreateBookingUseCase,
    GetAvailableSlotsUseCase,
    GetBookingByIdUseCase,
    SearchBookingsUseCase,
    BookingLifecycleUseCase,
    BookingPhasesUseCase,
  ],
  exports: [
    BOOKING_REPOSITORY,
    GetBookingByIdUseCase,
    CreateBookingUseCase,
  ],
})
export class BookingModule {}
