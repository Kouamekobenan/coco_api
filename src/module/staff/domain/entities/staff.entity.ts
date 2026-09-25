import { StaffServiceEntity } from './staff-service.entity.js';
import { StaffWorkingHourEntity } from './staff-working-hour.entity.js';
import { StaffBreakEntity } from './staff-break.entity.js';
import { StaffTimeOffEntity } from './staff-time-off.entity.js';

export interface StaffProps {
  id: string;
  salonId: string;
  userId?: string | null;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  phone: string;
  avatarUrl?: string | null;
  bio?: string | null;
  roleTitle?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations chargées
  services?: StaffServiceEntity[];
  workingHours?: StaffWorkingHourEntity[];
  breaks?: StaffBreakEntity[];
  timeOffs?: StaffTimeOffEntity[];
}

export class StaffEntity {
  private constructor(private readonly props: StaffProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    userId?: string | null;
    firstName: string;
    lastName: string;
    displayName?: string | null;
    phone: string;
    avatarUrl?: string | null;
    bio?: string | null;
    roleTitle?: string | null;
  }): StaffEntity {
    const now = new Date();
    return new StaffEntity({
      id: props.id,
      salonId: props.salonId,
      userId: props.userId ?? null,
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      displayName: props.displayName ? props.displayName.trim() : null,
      phone: props.phone.trim(),
      avatarUrl: props.avatarUrl ?? null,
      bio: props.bio ?? null,
      roleTitle: props.roleTitle ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      services: [],
      workingHours: [],
      breaks: [],
      timeOffs: [],
    });
  }

  public static reconstitute(props: StaffProps): StaffEntity {
    return new StaffEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getUserId(): string | null {
    return this.props.userId ?? null;
  }

  public getFirstName(): string {
    return this.props.firstName;
  }

  public getLastName(): string {
    return this.props.lastName;
  }

  public getDisplayName(): string | null {
    return this.props.displayName ?? null;
  }

  public getFullName(): string {
    if (this.props.displayName) return this.props.displayName;
    return `${this.props.firstName} ${this.props.lastName}`.trim();
  }

  public getPhone(): string {
    return this.props.phone;
  }

  public getAvatarUrl(): string | null {
    return this.props.avatarUrl ?? null;
  }

  public getBio(): string | null {
    return this.props.bio ?? null;
  }

  public getRoleTitle(): string | null {
    return this.props.roleTitle ?? null;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getServices(): StaffServiceEntity[] {
    return this.props.services ?? [];
  }

  public getWorkingHours(): StaffWorkingHourEntity[] {
    return this.props.workingHours ?? [];
  }

  public getBreaks(): StaffBreakEntity[] {
    return this.props.breaks ?? [];
  }

  public getTimeOffs(): StaffTimeOffEntity[] {
    return this.props.timeOffs ?? [];
  }

  public setServices(services: StaffServiceEntity[]): void {
    this.props.services = services;
  }

  public setWorkingHours(hours: StaffWorkingHourEntity[]): void {
    this.props.workingHours = hours;
  }

  public setBreaks(breaks: StaffBreakEntity[]): void {
    this.props.breaks = breaks;
  }

  public setTimeOffs(timeOffs: StaffTimeOffEntity[]): void {
    this.props.timeOffs = timeOffs;
  }

  public updateProfile(data: {
    userId?: string | null;
    firstName?: string;
    lastName?: string;
    displayName?: string | null;
    phone?: string;
    avatarUrl?: string | null;
    bio?: string | null;
    roleTitle?: string | null;
    isActive?: boolean;
  }): void {
    if (data.userId !== undefined) this.props.userId = data.userId;
    if (data.firstName !== undefined) this.props.firstName = data.firstName.trim();
    if (data.lastName !== undefined) this.props.lastName = data.lastName.trim();
    if (data.displayName !== undefined) this.props.displayName = data.displayName ? data.displayName.trim() : null;
    if (data.phone !== undefined) this.props.phone = data.phone.trim();
    if (data.avatarUrl !== undefined) this.props.avatarUrl = data.avatarUrl;
    if (data.bio !== undefined) this.props.bio = data.bio;
    if (data.roleTitle !== undefined) this.props.roleTitle = data.roleTitle;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    this.props.updatedAt = new Date();
  }
}
