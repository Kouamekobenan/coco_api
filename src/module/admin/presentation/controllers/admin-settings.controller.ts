import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { AdminSettingsUseCase } from '../../application/usecases/admin-settings.usecase.js';
import { AdminUpsertSettingDto } from '../../application/dtos/admin.dto.js';
import { IAdminSettingsRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/settings', version: '1' })
export class AdminSettingsController implements IAdminSettingsRoutes {
  constructor(private readonly settingsUseCase: AdminSettingsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Lister tous les paramètres et configurations globales de la plateforme',
    description: 'Taux de commission, délais d\'expiration des acomptes, feature flags, etc.',
  })
  @ApiResponse({ status: 200, description: 'Paramètres récupérés.' })
  public async getSettings() {
    return this.settingsUseCase.getSettings();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obtenir la valeur d\'un paramètre spécifique par sa clé' })
  @ApiResponse({ status: 200, description: 'Valeur du paramètre.' })
  public async getSettingByKey(@Param('key') key: string) {
    return this.settingsUseCase.getSettingByKey(key);
  }

  @Put(':key')
  @ApiOperation({
    summary: 'Créer ou mettre à jour un paramètre système (avec justification d\'audit)',
  })
  @ApiResponse({ status: 200, description: 'Paramètre mis à jour avec succès.' })
  public async upsertSetting(
    @Param('key') key: string,
    @Body() dto: AdminUpsertSettingDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.settingsUseCase.upsertSetting(key, dto, adminUser.sub);
  }
}
