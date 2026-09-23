import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

@Injectable()
export class ToggleUserStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable.`);
    }

    if (user.isActive()) {
      user.deactivate();
    } else {
      user.activate();
    }

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
