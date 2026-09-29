import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import { UpdateProfileDto } from '../dtos/update-profile.dto.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsException } from '../../domain/exceptions/domain.exception.js';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable.`);
    }

    const normalizedEmail = dto.email ? dto.email.toLowerCase().trim() : dto.email;

    if (normalizedEmail && normalizedEmail !== user.getEmail()?.toLowerCase()) {
      const existingUser = await this.userRepository.findByEmail(normalizedEmail);
      if (existingUser && existingUser.getId() !== userId) {
        throw new UserEmailAlreadyExistsException(normalizedEmail);
      }
    }

    user.updateProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizedEmail,
      avatarUrl: dto.avatarUrl,
      defaultUniverse: dto.defaultUniverse,
    });

    await this.userRepository.update(user);

    return this.mapToResponse(user);
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
