import { Inject, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.port.js';
import type { ITokenService } from '../ports/token-service.port.js';
import { TOKEN_SERVICE } from '../ports/token-service.port.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';
import {
  UserAlreadyExistsException,
  UserEmailAlreadyExistsException,
} from '../../domain/exceptions/domain.exception.js';
import { RegisterDto } from '../dtos/register.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import type { LoginMetadata } from './login-user.usecase.js';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @Optional()
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository?: ISessionRepository,
  ) {}

  public async execute(dto: RegisterDto, metadata?: LoginMetadata): Promise<AuthResponseDto> {
    // 1. Validation et normalisation du téléphone au format +225
    const phone = PhoneNumber.create(dto.phone);

    // 2. Vérification d'unicité (téléphone et email)
    const phoneExists = await this.userRepository.existsByPhone(phone);
    if (phoneExists) {
      throw new UserAlreadyExistsException(phone.getNationalFormat());
    }

    const normalizedEmail = dto.email ? dto.email.toLowerCase().trim() : null;
    if (normalizedEmail) {
      const emailExists = await this.userRepository.existsByEmail(normalizedEmail);
      if (emailExists) {
        throw new UserEmailAlreadyExistsException(normalizedEmail);
      }
    }

    // 3. Validation et hachage sécurisé du mot de passe
    Password.validateRaw(dto.password);
    const passwordHash = await this.passwordHasher.hash(dto.password);
    const password = Password.fromHash(passwordHash);

    // 4. Instanciation de l'agrégat User
    const user = UserEntity.create({
      id: randomUUID(),
      phone,
      password,
      email: normalizedEmail,
      firstName: dto.firstName?.trim() ?? null,
      lastName: dto.lastName?.trim() ?? null,
      defaultUniverse: dto.defaultUniverse ?? 'COCOMOUSSO',
    });

    // 5. Persistance
    await this.userRepository.save(user);

    // 6. Génération des tokens JWT
    const tokens = await this.tokenService.generateTokens({
      sub: user.getId(),
      phone: user.getPhone().getValue(),
      universe: user.getDefaultUniverse(),
      isSuperAdmin: user.isSuperAdmin(),
    });

    // 7. Enregistrement de la session active en base
    if (this.sessionRepository) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
      const session = SessionEntity.create({
        id: randomUUID(),
        userId: user.getId(),
        refreshToken: tokens.refreshToken,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        deviceId: metadata?.deviceId,
      });
      await this.sessionRepository.save(session);
    }

    // 8. Mapping réponse
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
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
