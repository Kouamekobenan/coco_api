import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import { FindUsersQueryDto } from '../dtos/find-users-query.dto.js';
import { PaginatedUsersResponseDto } from '../dtos/paginated-users-response.dto.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(query: FindUsersQueryDto): Promise<PaginatedUsersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
      search: query.search,
      universe: query.universe,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: users.map((u) => this.mapToResponse(u)),
      total,
      page,
      limit,
      totalPages,
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
