import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { ITokenService } from '../ports/token-service.port.js';
import { TOKEN_SERVICE } from '../ports/token-service.port.js';
import { RefreshTokenDto } from '../dtos/refresh-token.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  public async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    // 1. Vérification cryptographique de la signature et de la date du refresh token
    let payload;
    try {
      payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    // 2. Recherche et vérification de la session en base de données
    const session = await this.sessionRepository.findByRefreshToken(dto.refreshToken);
    if (!session || !session.isValid()) {
      throw new UnauthorizedException('Session expirée ou révoquée. Veuillez vous reconnecter.');
    }

    // 3. Vérification de l'utilisateur associé
    const user = await this.userRepository.findById(session.getUserId());
    if (!user || !user.isActive()) {
      throw new UnauthorizedException('Compte utilisateur inactif ou introuvable.');
    }

    // 4. Génération de la nouvelle paire de tokens
    const newTokens = await this.tokenService.generateTokens({
      sub: user.getId(),
      phone: user.getPhone().getValue(),
      universe: user.getDefaultUniverse(),
      isSuperAdmin: user.isSuperAdmin(),
    });

    // 5. Rotation du refresh token : mise à jour de la session
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    session.rotateRefreshToken(newTokens.refreshToken, newExpiresAt);
    await this.sessionRepository.update(session);

    // 6. Retour de la réponse d'authentification
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: newTokens.expiresIn,
      user: this.mapToResponse(user),
    };
  }

  private mapToResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.getId(),
      phone: user.getPhone().getValue(),
      nationalPhone: user.getPhone().getNationalFormat(),
      email: user.getEmail(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      fullName: user.getFullName(),
      avatarUrl: user.getAvatarUrl(),
      defaultUniverse: user.getDefaultUniverse(),
      isPhoneVerified: user.isPhoneVerified(),
      isActive: user.isActive(),
      isSuperAdmin: user.isSuperAdmin(),
      createdAt: user.getCreatedAt(),
    };
  }
}
