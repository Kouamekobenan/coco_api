import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ReviewUseCase } from './application/usecases/review.usecase.js';
import { ReviewsController } from './presentation/controllers/reviews.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewUseCase],
})
export class ReviewModule {}
