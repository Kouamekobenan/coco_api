import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Domain Token & Infrastructure Adapter
import { ADMIN_REPOSITORY } from './domain/repositories/admin.repository.interface.js';
import { PrismaAdminRepository } from './infrastructure/persistence/prisma-admin.repository.js';
import { SuperAdminGuard } from './infrastructure/security/super-admin.guard.js';

// Application Use Cases
import { AdminDashboardUseCase } from './application/usecases/admin-dashboard.usecase.js';
import { AdminSalonsUseCase } from './application/usecases/admin-salons.usecase.js';
import { AdminUsersUseCase } from './application/usecases/admin-users.usecase.js';
import { AdminReviewsUseCase } from './application/usecases/admin-reviews.usecase.js';
import { AdminFinanceUseCase } from './application/usecases/admin-finance.usecase.js';
import { AdminSettingsUseCase } from './application/usecases/admin-settings.usecase.js';
import { AdminAuditUseCase } from './application/usecases/admin-audit.usecase.js';

// Presentation Controllers
import { AdminDashboardController } from './presentation/controllers/admin-dashboard.controller.js';
import { AdminSalonsController } from './presentation/controllers/admin-salons.controller.js';
import { AdminUsersController } from './presentation/controllers/admin-users.controller.js';
import { AdminReviewsController } from './presentation/controllers/admin-reviews.controller.js';
import { AdminFinanceController } from './presentation/controllers/admin-finance.controller.js';
import { AdminSettingsController } from './presentation/controllers/admin-settings.controller.js';
import { AdminAuditController } from './presentation/controllers/admin-audit.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminDashboardController,
    AdminSalonsController,
    AdminUsersController,
    AdminReviewsController,
    AdminFinanceController,
    AdminSettingsController,
    AdminAuditController,
  ],
  providers: [
    {
      provide: ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository,
    },
    SuperAdminGuard,
    AdminDashboardUseCase,
    AdminSalonsUseCase,
    AdminUsersUseCase,
    AdminReviewsUseCase,
    AdminFinanceUseCase,
    AdminSettingsUseCase,
    AdminAuditUseCase,
  ],
  exports: [
    ADMIN_REPOSITORY,
    SuperAdminGuard,
    AdminDashboardUseCase,
    AdminSalonsUseCase,
    AdminUsersUseCase,
    AdminReviewsUseCase,
    AdminFinanceUseCase,
    AdminSettingsUseCase,
    AdminAuditUseCase,
  ],
})
export class AdminModule {}
