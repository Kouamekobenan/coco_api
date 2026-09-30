import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { AdminSalonsUseCase } from '../../application/usecases/admin-salons.usecase.js';
import {
  AdminReassignOwnerDto,
  AdminSalonsQueryDto,
  AdminUpdateSalonStatusDto,
} from '../../application/dtos/admin.dto.js';
import { IAdminSalonsRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/salons', version: '1' })
export class AdminSalonsController implements IAdminSalonsRoutes {
  constructor(private readonly salonsUseCase: AdminSalonsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Lister tous les salons de la plateforme (avec filtres statut, univers, mot-clé)',
  })
  @ApiResponse({ status: 200, description: 'Liste des salons paginée.' })
  public async getSalons(@Query() query: AdminSalonsQueryDto) {
    return this.salonsUseCase.getSalons(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir la fiche 360° détaillée d\'un salon' })
  @ApiResponse({ status: 200, description: 'Détails du salon.' })
  public async getSalonById(@Param('id') id: string) {
    return this.salonsUseCase.getSalonById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'un salon (Approuver, Suspendre, Réactiver, Archiver)',
    description: 'Chaque modification est tracée de manière immuable dans l\'AuditLog.',
  })
  @ApiResponse({ status: 200, description: 'Statut du salon mis à jour.' })
  public async updateSalonStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateSalonStatusDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.salonsUseCase.updateSalonStatus(id, dto, adminUser.sub);
  }

  @Patch(':id/owner')
  @ApiOperation({
    summary: 'Réassigner le propriétaire principal d\'un salon (SALON_OWNER)',
  })
  @ApiResponse({ status: 200, description: 'Nouveau propriétaire assigné.' })
  public async reassignSalonOwner(
    @Param('id') id: string,
    @Body() dto: AdminReassignOwnerDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.salonsUseCase.reassignSalonOwner(id, dto, adminUser.sub);
  }
}
