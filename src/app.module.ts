import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './module/auth/auth.module.js';
import { SalonModule } from './module/salon/salon.module.js';
import { ServiceModule } from './module/service/service.module.js';
import { StaffModule } from './module/staff/staff.module.js';
import { CustomerModule } from './module/customer/customer.module.js';
import { BookingModule } from './module/booking/booking.module.js';
import { QueueModule } from './module/queue/queue.module.js';
import { PaymentModule } from './module/payment/payment.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'coco_api',
    }),
    PrismaModule,
    AuthModule,
    SalonModule,
    ServiceModule,
    StaffModule,
    CustomerModule,
    BookingModule,
    QueueModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
