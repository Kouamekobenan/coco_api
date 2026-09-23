import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { UserMapper } from './user.mapper.js';
import { AppUniverse as PrismaAppUniverse } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(user: UserEntity): Promise<void> {
    const data = UserMapper.toPrismaCreate(user);
    await this.prisma.user.create({ data });
  }

  public async findByPhone(phone: PhoneNumber): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { phone: phone.getValue() },
    });
    if (!raw) return null;
    return UserMapper.toDomain(raw);
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return UserMapper.toDomain(raw);
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!raw) return null;
    return UserMapper.toDomain(raw);
  }

  public async existsByPhone(phone: PhoneNumber): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { phone: phone.getValue() },
    });
    return count > 0;
  }

  public async update(user: UserEntity): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        phone: user.getPhone().getValue(),
        passwordHash: user.getPassword().getHashedValue(),
        email: user.getEmail(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        avatarUrl: user.getAvatarUrl(),
        defaultUniverse: user.getDefaultUniverse() as PrismaAppUniverse,
        isPhoneVerified: user.isPhoneVerified(),
        isActive: user.isActive(),
        isSuperAdmin: user.isSuperAdmin(),
        updatedAt: user.getUpdatedAt(),
      },
    });
  }
}
