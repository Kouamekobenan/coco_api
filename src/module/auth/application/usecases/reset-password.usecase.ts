import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.port.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  public async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    // 1. Normalisation du numéro de téléphone
    const phone = PhoneNumber.create(dto.phone);

    // 2. Recherche de l'utilisateur
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      throw new NotFoundException(`Aucun compte associé au numéro "${phone.getNationalFormat()}".`);
    }

    // 3. Validation et hachage du nouveau mot de passe
    Password.validateRaw(dto.newPassword);
    const newHash = await this.passwordHasher.hash(dto.newPassword);
    const newPassword = Password.fromHash(newHash);

    // 4. Mise à jour et persistance
    user.updatePassword(newPassword);
    await this.userRepository.update(user);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}
