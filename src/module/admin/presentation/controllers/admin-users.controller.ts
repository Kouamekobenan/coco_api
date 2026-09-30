import {
  Body,
  Controller,
  Delete,
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
import { AdminUsersUseCase } from '../../application/usecases/admin-users.usecase.js';
import {
  AdminUpdateUserRoleDto,
  AdminUsersQueryDto,
} from '../../application/dtos/admin.dto.js';
import { IAdminUsersRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/users', version: '1' })
export class AdminUsersController implements IAdminUsersRoutes {
  constructor(private readonly usersUseCase: AdminUsersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Lister tous les utilisateurs inscrits sur Coco Platform',
  })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs paginée.' })
  public async getUsers(@Query() query: AdminUsersQueryDto) {
    return this.usersUseCase.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir la vue 360° détaillée d\'un compte utilisateur' })
  @ApiResponse({ status: 200, description: 'Détails de l\'utilisateur.' })
  public async getUserById(@Param('id') id: string) {
    return this.usersUseCase.getUserById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activer ou suspendre/bannir un compte utilisateur' })
  @ApiResponse({ status: 200, description: 'Statut du compte basculé.' })
  public async toggleUserStatus(
    @Param('id') id: string,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.usersUseCase.toggleUserStatus(id, adminUser.sub);
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Promouvoir ou révoquer le rôle Super-Administrateur d\'un utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Privilèges Super-Admin mis à jour.' })
  public async updateUserRole(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserRoleDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.usersUseCase.updateUserRole(id, dto, adminUser.sub);
  }

  @Delete(':id/sessions')
  @ApiOperation({
    summary: 'Révoquer d\'urgence toutes les sessions actives d\'un utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Sessions révoquées.' })
  public async revokeUserSessions(
    @Param('id') id: string,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.usersUseCase.revokeUserSessions(id, adminUser.sub);
  }
}
