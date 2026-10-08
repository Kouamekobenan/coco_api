import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AppQueueModule } from './common/queue/app-queue.module.js';
import { LockModule } from './common/lock/lock.module.js';
import { FirebaseModule } from './common/firebase/firebase.module.js';
import { AuthModule } from './module/auth/auth.module.js';
import { SalonModule } from './module/salon/salon.module.js';
import { ServiceModule } from './module/service/service.module.js';
import { StaffModule } from './module/staff/staff.module.js';
import { CustomerModule } from './module/customer/customer.module.js';
import { BookingModule } from './module/booking/booking.module.js';
import { QueueModule } from './module/queue/queue.module.js';
import { PaymentModule } from './module/payment/payment.module.js';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module.js';
import { SubscriptionModule } from './module/subscription/subscription.module.js';
import { AdminModule } from './module/admin/admin.module.js';
import { NotificationModule } from './module/notification/notification.module.js';
import { HealthModule } from './module/health/health.module.js';
import { SalonBillingModule } from './module/salon-billing/salon-billing.module.js';
import { ScheduleModule } from '@nestjs/schedule';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'coco_api',
    }),
    HealthModule,
    AppQueueModule,
    LockModule,
    FirebaseModule,
    PrismaModule,
    AuthModule,
    SalonModule,
    ServiceModule,
    StaffModule,
    CustomerModule,
    BookingModule,
    QueueModule,
    PaymentModule,
    CloudinaryModule,
    SubscriptionModule,
    AdminModule,
    NotificationModule,
    SalonBillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
