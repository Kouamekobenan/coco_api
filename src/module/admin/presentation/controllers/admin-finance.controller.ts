import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { AdminFinanceUseCase } from '../../application/usecases/admin-finance.usecase.js';
import {
  AdminCreatePayoutDto,
  AdminFinanceQueryDto,
} from '../../application/dtos/admin.dto.js';
import { IAdminFinanceRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/finance', version: '1' })
export class AdminFinanceController implements IAdminFinanceRoutes {
  constructor(private readonly financeUseCase: AdminFinanceUseCase) {}

  @Get('ledger')
  @ApiOperation({
    summary: 'Consulter le Grand Livre (Ledger) global de la plateforme',
    description: 'Historique des crédits d\'acomptes, débits de commission et reversements.',
  })
  @ApiResponse({ status: 200, description: 'Écritures comptables récupérées.' })
  public async getLedger(@Query() query: AdminFinanceQueryDto) {
    return this.financeUseCase.getLedger(query);
  }

  @Get('salons/:salonId/balance')
  @ApiOperation({
    summary: 'Consulter le solde du compte séquestre d\'un salon spécifique',
  })
  @ApiResponse({ status: 200, description: 'Solde du salon en FCFA.' })
  public async getSalonBalance(@Param('salonId') salonId: string) {
    return this.financeUseCase.getSalonBalance(salonId);
  }

  @Post('payouts')
  @ApiOperation({
    summary: 'Enregistrer un virement / reversement de fonds vers un salon',
    description: 'Débite le compte séquestre du salon avec référence Wave / virement et trace dans l\'AuditLog.',
  })
  @ApiResponse({ status: 201, description: 'Reversement enregistré avec succès.' })
  public async createPayout(
    @Body() dto: AdminCreatePayoutDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.financeUseCase.createPayout(dto, adminUser.sub);
  }
}
