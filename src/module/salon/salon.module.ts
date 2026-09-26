import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module.js';

// Domain Token & Interface
import { SALON_REPOSITORY } from './domain/repositories/salon.repository.interface.js';

// Infrastructure Persistence Adapter
import { PrismaSalonRepository } from './infrastructure/persistence/prisma-salon.repository.js';

// Application Use Cases - Salons
import { CreateSalonUseCase } from './application/usecases/create-salon.usecase.js';
import { GetSalonByIdUseCase } from './application/usecases/get-salon-by-id.usecase.js';
import { GetSalonBySlugUseCase } from './application/usecases/get-salon-by-slug.usecase.js';
import { SearchSalonsUseCase } from './application/usecases/search-salons.usecase.js';
import { FindNearbySalonsUseCase } from './application/usecases/find-nearby-salons.usecase.js';
import { UpdateSalonUseCase } from './application/usecases/update-salon.usecase.js';
import { UpdateSalonStatusUseCase } from './application/usecases/update-salon-status.usecase.js';
import { VerifySalonUseCase } from './application/usecases/verify-salon.usecase.js';
import { DeleteSalonUseCase } from './application/usecases/delete-salon.usecase.js';
import {
  UploadSalonCoverUseCase,
  UploadSalonLogoUseCase,
  UploadSalonMediaFileUseCase,
} from './application/usecases/upload-salon-images.usecase.js';

// Application Use Cases - Expérience & Vitrine
import {
  GetSalonExperienceUseCase,
  UpdateSalonExperienceUseCase,
} from './application/usecases/salon-experience.usecase.js';

// Application Use Cases - Horaires
import {
  AddSalonHourExceptionUseCase,
  DeleteSalonHourExceptionUseCase,
  GetSalonHoursUseCase,
  UpdateSalonHoursUseCase,
} from './application/usecases/salon-hours.usecase.js';

// Application Use Cases - Médias
import {
  AddSalonMediaUseCase,
  DeleteSalonMediaUseCase,
  GetSalonMediaUseCase,
  ReorderSalonMediaUseCase,
} from './application/usecases/salon-media.usecase.js';

// Application Use Cases - Promotions
import {
  CreateSalonPromotionUseCase,
  DeleteSalonPromotionUseCase,
  GetSalonPromotionsUseCase,
  UpdateSalonPromotionUseCase,
} from './application/usecases/salon-promotions.usecase.js';

// Presentation Controllers
import { SalonsController } from './presentation/controllers/salons.controller.js';
import { SalonExperienceController } from './presentation/controllers/salon-experience.controller.js';
import { SalonHoursController } from './presentation/controllers/salon-hours.controller.js';
import { SalonMediaController } from './presentation/controllers/salon-media.controller.js';
import { SalonPromotionsController } from './presentation/controllers/salon-promotions.controller.js';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [
    SalonsController,
    SalonExperienceController,
    SalonHoursController,
    SalonMediaController,
    SalonPromotionsController,
  ],
  providers: [
    // IoC Port -> Adapter binding (DDD)
    {
      provide: SALON_REPOSITORY,
      useClass: PrismaSalonRepository,
    },

    // Salons Use Cases
    CreateSalonUseCase,
    GetSalonByIdUseCase,
    GetSalonBySlugUseCase,
    SearchSalonsUseCase,
    FindNearbySalonsUseCase,
    UpdateSalonUseCase,
    UpdateSalonStatusUseCase,
    VerifySalonUseCase,
    DeleteSalonUseCase,

    // Cloudinary Upload Use Cases
    UploadSalonLogoUseCase,
    UploadSalonCoverUseCase,
    UploadSalonMediaFileUseCase,

    // Experience Use Cases
    GetSalonExperienceUseCase,
    UpdateSalonExperienceUseCase,

    // Hours Use Cases
    GetSalonHoursUseCase,
    UpdateSalonHoursUseCase,
    AddSalonHourExceptionUseCase,
    DeleteSalonHourExceptionUseCase,

    // Media Use Cases
    GetSalonMediaUseCase,
    AddSalonMediaUseCase,
    ReorderSalonMediaUseCase,
    DeleteSalonMediaUseCase,

    // Promotions Use Cases
    GetSalonPromotionsUseCase,
    CreateSalonPromotionUseCase,
    UpdateSalonPromotionUseCase,
    DeleteSalonPromotionUseCase,
  ],
  exports: [
    SALON_REPOSITORY,
    GetSalonByIdUseCase,
    GetSalonBySlugUseCase,
    UploadSalonLogoUseCase,
    UploadSalonCoverUseCase,
    UploadSalonMediaFileUseCase,
  ],
})
export class SalonModule {}
