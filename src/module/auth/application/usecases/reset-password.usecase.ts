import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.port.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { FirebaseAdminService } from '../../../../common/firebase/firebase-admin.service.js';

export interface ResetPasswordResult {
  message: string;
  phone: string;
  sessionsRevoked: number;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  public async execute(dto: ResetPasswordDto): Promise<ResetPasswordResult> {
    // 1. Validation cryptographique du jeton Firebase Phone Auth
    const decodedToken = await this.firebaseAdminService.verifyIdToken(dto.firebaseIdToken);
    const verifiedPhone = decodedToken.phone_number;

    if (!verifiedPhone) {
      throw new BadRequestException(
        'Le jeton Firebase fourni ne contient aucun numéro de téléphone vérifié par SMS.',
      );
    }

    // 2. Normalisation du numéro certifié
    const phone = PhoneNumber.create(verifiedPhone);

    // Si le numéro a aussi été passé manuellement dans le DTO, vérifier la cohérence
    if (dto.phone) {
      const explicitPhone = PhoneNumber.create(dto.phone);
      if (explicitPhone.getValue() !== phone.getValue()) {
        throw new BadRequestException(
          'Le numéro de téléphone fourni ne correspond pas à celui vérifié par le jeton Firebase.',
        );
      }
    }

    // 3. Recherche de l'utilisateur
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      throw new NotFoundException(
        `Aucun compte associé au numéro "${phone.getNationalFormat()}".`,
      );
    }

    // 4. Validation et hachage du nouveau mot de passe
    Password.validateRaw(dto.newPassword);
    const newHash = await this.passwordHasher.hash(dto.newPassword);
    const newPassword = Password.fromHash(newHash);

    // 5. Mise à jour de l'entité utilisateur
    user.updatePassword(newPassword);
    if (!user.isPhoneVerified()) {
      user.verifyPhone();
    }
    await this.userRepository.update(user);

    // 6. Révocation de toutes les sessions actives (Sécurité post-réinitialisation)
    const revokedSessions = await this.sessionRepository.revokeAllForUser(user.getId());

    return {
      message: 'Mot de passe réinitialisé avec succès.',
      phone: phone.getValue(),
      sessionsRevoked: revokedSessions,
    };
  }
}
