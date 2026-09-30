import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { AdminDashboardUseCase } from '../../application/usecases/admin-dashboard.usecase.js';
import { IAdminDashboardRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/dashboard', version: '1' })
export class AdminDashboardController implements IAdminDashboardRoutes {
  constructor(private readonly dashboardUseCase: AdminDashboardUseCase) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'Consulter les métriques et KPIs globaux de la plateforme',
    description:
      'Retourne le volume global de salons (actifs, en attente), réservations, CA (GMV) en FCFA, commissions et avis.',
  })
  @ApiResponse({ status: 200, description: 'KPIs récupérés avec succès.' })
  public async getKpis() {
    return this.dashboardUseCase.getKpis();
  }

  @Get('payment-stats')
  @ApiOperation({
    summary: 'Statistiques des flux de paiements par opérateur Mobile Money / Cash',
    description:
      'Ventilation des transactions réussies par opérateur (Wave, Orange Money, MTN MoMo, Moov, Cash).',
  })
  @ApiResponse({ status: 200, description: 'Statistiques de paiement récupérées.' })
  public async getPaymentStats() {
    return this.dashboardUseCase.getPaymentStats();
  }
}
