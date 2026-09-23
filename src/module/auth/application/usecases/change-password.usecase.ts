import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.port.js';
import { Password } from '../../domain/value-objects/password.vo.js';
import { ChangePasswordDto } from '../dtos/change-password.dto.js';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  public async execute(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable.`);
    }

    // 1. Vérification de l'ancien mot de passe
    const isCurrentValid = await this.passwordHasher.compare(
      dto.currentPassword,
      user.getPassword().getHashedValue(),
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('L’ancien mot de passe est incorrect.');
    }

    // 2. Validation et hachage du nouveau mot de passe
    Password.validateRaw(dto.newPassword);
    const newHash = await this.passwordHasher.hash(dto.newPassword);
    const newPassword = Password.fromHash(newHash);

    // 3. Mise à jour et persistance
    user.updatePassword(newPassword);
    await this.userRepository.update(user);

    return { message: 'Mot de passe modifié avec succès.' };
  }
}
