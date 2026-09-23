import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.port.js';
import type { ITokenService } from '../ports/token-service.port.js';
import { TOKEN_SERVICE } from '../ports/token-service.port.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { InvalidCredentialsException } from '../../domain/exceptions/domain.exception.js';
import { LoginDto } from '../dtos/login.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  public async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Normalisation du numéro de téléphone
    let phone: PhoneNumber;
    try {
      phone = PhoneNumber.create(dto.phone);
    } catch {
      throw new InvalidCredentialsException();
    }

    // 2. Recherche de l'utilisateur
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 3. Vérification du statut actif
    if (!user.isActive()) {
      throw new UnauthorizedException('Ce compte utilisateur a été suspendu ou désactivé.');
    }

    // 4. Comparaison sécurisée du hash du mot de passe
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.getPassword().getHashedValue(),
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 5. Émission des tokens JWT
    const tokens = await this.tokenService.generateTokens({
      sub: user.getId(),
      phone: user.getPhone().getValue(),
      universe: user.getDefaultUniverse(),
      isSuperAdmin: user.isSuperAdmin(),
    });

    // 6. Mapping réponse
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
