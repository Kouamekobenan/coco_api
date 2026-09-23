import { UserEntity } from '../entities/user.entity.js';
import { PhoneNumber } from '../value-objects/phone-number.vo.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface FindAllUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  universe?: string;
}

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findByPhone(phone: PhoneNumber): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByPhone(phone: PhoneNumber): Promise<boolean>;
  update(user: UserEntity): Promise<void>;
  findAll(options: FindAllUsersOptions): Promise<{ users: UserEntity[]; total: number }>;
  delete(id: string): Promise<void>;
}
