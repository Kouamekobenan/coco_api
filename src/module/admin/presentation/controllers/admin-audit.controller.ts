import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { AdminAuditUseCase } from '../../application/usecases/admin-audit.usecase.js';
import { AdminAuditLogsQueryDto } from '../../application/dtos/admin.dto.js';
import { IAdminAuditRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/audit-logs', version: '1' })
export class AdminAuditController implements IAdminAuditRoutes {
  constructor(private readonly auditUseCase: AdminAuditUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Consulter les journaux d\'audit de sécurité (AuditLog immuable)',
    description:
      'Historique complet de toutes les actions Super-Admin avec avant/après, IP, date et justification.',
  })
  @ApiResponse({ status: 200, description: 'Journaux d\'audit récupérés.' })
  public async getAuditLogs(@Query() query: AdminAuditLogsQueryDto) {
    return this.auditUseCase.getAuditLogs(query);
  }
}
