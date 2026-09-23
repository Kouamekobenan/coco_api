import { PhoneNumber } from '../value-objects/phone-number.vo.js';
import { Password } from '../value-objects/password.vo.js';

export type AppUniverseType = 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

export interface UserProps {
  id: string;
  phone: PhoneNumber;
  password: Password;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  defaultUniverse: AppUniverseType;
  isPhoneVerified: boolean;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  public static create(props: {
    id: string;
    phone: PhoneNumber;
    password: Password;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    defaultUniverse?: AppUniverseType;
  }): UserEntity {
    const now = new Date();
    return new UserEntity({
      id: props.id,
      phone: props.phone,
      password: props.password,
      email: props.email ?? null,
      firstName: props.firstName ?? null,
      lastName: props.lastName ?? null,
      avatarUrl: props.avatarUrl ?? null,
      defaultUniverse: props.defaultUniverse ?? 'COCOMOUSSO',
      isPhoneVerified: false,
      isActive: true,
      isSuperAdmin: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getPhone(): PhoneNumber {
    return this.props.phone;
  }

  public getPassword(): Password {
    return this.props.password;
  }

  public getEmail(): string | null {
    return this.props.email ?? null;
  }

  public getFirstName(): string | null {
    return this.props.firstName ?? null;
  }

  public getLastName(): string | null {
    return this.props.lastName ?? null;
  }

  public getFullName(): string {
    const parts = [this.props.firstName, this.props.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : this.props.phone.getNationalFormat();
  }

  public getAvatarUrl(): string | null {
    return this.props.avatarUrl ?? null;
  }

  public getDefaultUniverse(): AppUniverseType {
    return this.props.defaultUniverse;
  }

  public isPhoneVerified(): boolean {
    return this.props.isPhoneVerified;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public isSuperAdmin(): boolean {
    return this.props.isSuperAdmin;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Comportements métier
  public verifyPhone(): void {
    this.props.isPhoneVerified = true;
    this.props.updatedAt = new Date();
  }

  public changeUniverse(universe: AppUniverseType): void {
    this.props.defaultUniverse = universe;
    this.props.updatedAt = new Date();
  }

  public updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    defaultUniverse?: AppUniverseType;
  }): void {
    if (data.firstName !== undefined) this.props.firstName = data.firstName;
    if (data.lastName !== undefined) this.props.lastName = data.lastName;
    if (data.email !== undefined) this.props.email = data.email;
    if (data.avatarUrl !== undefined) this.props.avatarUrl = data.avatarUrl;
    if (data.defaultUniverse !== undefined) this.props.defaultUniverse = data.defaultUniverse;
    this.props.updatedAt = new Date();
  }

  public updatePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }
}
