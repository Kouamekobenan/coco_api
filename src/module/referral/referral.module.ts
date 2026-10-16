import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ReferralUseCase } from './application/usecases/referral.usecase.js';
import { ReferralEventListener } from './infrastructure/listeners/referral-event.listener.js';
import { ReferralController } from './presentation/controllers/referral.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReferralController],
  providers: [ReferralUseCase, ReferralEventListener],
})
export class ReferralModule {}
