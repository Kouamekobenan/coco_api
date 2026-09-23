import { User as PrismaUser, AppUniverse as PrismaAppUniverse } from '@prisma/client';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';

export class UserMapper {
  public static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.reconstitute({
      id: raw.id,
      phone: PhoneNumber.create(raw.phone),
      password: Password.fromHash(raw.passwordHash),
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      avatarUrl: raw.avatarUrl,
      defaultUniverse: raw.defaultUniverse as 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED',
      isPhoneVerified: raw.isPhoneVerified,
      isActive: raw.isActive,
      isSuperAdmin: raw.isSuperAdmin,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrismaCreate(entity: UserEntity): {
    id: string;
    phone: string;
    passwordHash: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    defaultUniverse: PrismaAppUniverse;
    isPhoneVerified: boolean;
    isActive: boolean;
    isSuperAdmin: boolean;
  } {
    return {
      id: entity.getId(),
      phone: entity.getPhone().getValue(),
      passwordHash: entity.getPassword().getHashedValue(),
      email: entity.getEmail(),
      firstName: entity.getFirstName(),
      lastName: entity.getLastName(),
      avatarUrl: entity.getAvatarUrl(),
      defaultUniverse: entity.getDefaultUniverse() as PrismaAppUniverse,
      isPhoneVerified: entity.isPhoneVerified(),
      isActive: entity.isActive(),
      isSuperAdmin: entity.isSuperAdmin(),
    };
  }
}
