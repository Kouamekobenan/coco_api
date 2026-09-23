import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../application/ports/token-service.port.js';
import { GetProfileUseCase } from '../../application/usecases/get-profile.usecase.js';
import { UpdateProfileUseCase } from '../../application/usecases/update-profile.usecase.js';
import { ChangePasswordUseCase } from '../../application/usecases/change-password.usecase.js';
import { FindAllUsersUseCase } from '../../application/usecases/find-all-users.usecase.js';
import { ToggleUserStatusUseCase } from '../../application/usecases/toggle-user-status.usecase.js';
import { DeleteUserUseCase } from '../../application/usecases/delete-user.usecase.js';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto.js';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto.js';
import { FindUsersQueryDto } from '../../application/dtos/find-users-query.dto.js';
import { UserResponseDto } from '../../application/dtos/user-response.dto.js';
import { PaginatedUsersResponseDto } from '../../application/dtos/paginated-users-response.dto.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly toggleUserStatusUseCase: ToggleUserStatusUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Profil de l’utilisateur connecté',
    description: 'Retourne le profil complet de l’utilisateur à partir de son Bearer JWT.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  public async getMyProfile(
    @CurrentUser() user: TokenPayload,
  ): Promise<UserResponseDto> {
    return this.getProfileUseCase.execute(user.sub);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Modifier son compte / profil',
    description: 'Met à jour prénom, nom, email, avatar et univers par défaut.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  public async updateMyProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.updateProfileUseCase.execute(user.sub, dto);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Changer son mot de passe',
    description: 'Modifie le mot de passe après validation de l’ancien mot de passe.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Mot de passe modifié avec succès.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Ancien mot de passe incorrect.' })
  public async changeMyPassword(
    @CurrentUser() user: TokenPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.changePasswordUseCase.execute(user.sub, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer son compte (Droit à l’oubli)',
    description: 'Supprime définitivement le compte de l’utilisateur connecté.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compte supprimé avec succès.' })
  public async deleteMyAccount(
    @CurrentUser() user: TokenPayload,
  ): Promise<{ message: string }> {
    return this.deleteUserUseCase.execute(user.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les utilisateurs (avec pagination et recherche)',
    description: 'Permet de paginer et filtrer les utilisateurs par mot-clé (nom, tél) et univers.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedUsersResponseDto })
  public async findAllUsers(
    @Query() query: FindUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.findAllUsersUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulter un utilisateur par son ID',
    description: 'Retourne le profil public d’un utilisateur spécifié.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Utilisateur introuvable.' })
  public async findUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getProfileUseCase.execute(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activer ou suspendre un utilisateur (Admin)',
    description: 'Bascule le statut du compte entre actif et inactif.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  public async toggleUserStatus(@Param('id') id: string): Promise<UserResponseDto> {
    return this.toggleUserStatusUseCase.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un utilisateur (Admin)',
    description: 'Supprime un utilisateur spécifique.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compte supprimé avec succès.' })
  public async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.deleteUserUseCase.execute(id);
  }
}
