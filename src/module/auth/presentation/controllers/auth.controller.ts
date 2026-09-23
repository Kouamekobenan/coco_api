import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/usecases/register-user.usecase.js';
import { LoginUserUseCase } from '../../application/usecases/login-user.usecase.js';
import { GetProfileUseCase } from '../../application/usecases/get-profile.usecase.js';
import { ResetPasswordUseCase } from '../../application/usecases/reset-password.usecase.js';
import { RegisterDto } from '../../application/dtos/register.dto.js';
import { LoginDto } from '../../application/dtos/login.dto.js';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto.js';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto.js';
import { UserResponseDto } from '../../application/dtos/user-response.dto.js';
import { Public } from '../../infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../application/ports/token-service.port.js';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription d’un utilisateur',
    description:
      'Crée un nouvel utilisateur avec son numéro de téléphone (+225) et un mot de passe sécurisé. Retourne les tokens JWT et le profil.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Utilisateur créé avec succès.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Format de téléphone invalide (+225 attendu) ou mot de passe trop court.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un compte avec ce numéro de téléphone existe déjà.',
  })
  public async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion par téléphone et mot de passe',
    description:
      'Authentifie un utilisateur grâce à son numéro de téléphone (+225XXXXXXXXXX ou format local) et son mot de passe. Renvoie le token Bearer JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentification réussie.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Numéro de téléphone ou mot de passe incorrect.',
  })
  public async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser son mot de passe',
    description:
      'Permet de réinitialiser le mot de passe d’un compte directement via son numéro de téléphone.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe réinitialisé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aucun compte associé à ce numéro.',
  })
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Profil de l’utilisateur connecté',
    description: 'Récupère les informations du profil via le Bearer Token JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil récupéré avec succès.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token manquant, invalide ou expiré.',
  })
  public async getProfile(
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<UserResponseDto> {
    return this.getProfileUseCase.execute(currentUser.sub);
  }
}
