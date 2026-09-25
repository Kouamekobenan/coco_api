import { SalonSlug } from '../value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../value-objects/salon-coordinates.vo.js';
import { SalonExperienceConfigEntity } from './salon-experience-config.entity.js';
import { SalonHourEntity } from './salon-hour.entity.js';
import { SalonHourExceptionEntity } from './salon-hour-exception.entity.js';
import { SalonMediaEntity } from './salon-media.entity.js';
import { SalonPromotionEntity } from './salon-promotion.entity.js';
import { InvalidSalonStatusTransitionException } from '../exceptions/salon-domain.exception.js';

export type SalonStatusType = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type AppUniverseType = 'COCOTAILLE' | 'COCOMOUSSO' | 'MIXED';

export interface SalonProps {
  id: string;
  name: string;
  slug: SalonSlug;
  phone: string;
  whatsappPhone?: string | null;
  email?: string | null;
  description?: string | null;
  universe: AppUniverseType;
  status: SalonStatusType;

  // Géolocalisation & repères ivoiriens
  commune: string;
  quartier: string;
  landmark: string;
  coordinates: SalonCoordinates;
  address?: string | null;

  coverUrl?: string | null;
  logoUrl?: string | null;
  isVerified: boolean;
  verifiedAt?: Date | null;

  averageRating: number;
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations optionnelles chargées
  experienceConfig?: SalonExperienceConfigEntity | null;
  hours?: SalonHourEntity[];
  hourExceptions?: SalonHourExceptionEntity[];
  media?: SalonMediaEntity[];
  promotions?: SalonPromotionEntity[];
}

export class SalonEntity {
  private constructor(private readonly props: SalonProps) {}

  public static create(props: {
    id: string;
    name: string;
    slug: SalonSlug;
    phone: string;
    whatsappPhone?: string | null;
    email?: string | null;
    description?: string | null;
    universe?: AppUniverseType;
    commune: string;
    quartier: string;
    landmark: string;
    coordinates: SalonCoordinates;
    address?: string | null;
    coverUrl?: string | null;
    logoUrl?: string | null;
  }): SalonEntity {
    const now = new Date();
    return new SalonEntity({
      id: props.id,
      name: props.name.trim(),
      slug: props.slug,
      phone: props.phone.trim(),
      whatsappPhone: props.whatsappPhone ?? null,
      email: props.email ?? null,
      description: props.description ?? null,
      universe: props.universe ?? 'MIXED',
      status: 'DRAFT',
      commune: props.commune.trim(),
      quartier: props.quartier.trim(),
      landmark: props.landmark.trim(),
      coordinates: props.coordinates,
      address: props.address ?? null,
      coverUrl: props.coverUrl ?? null,
      logoUrl: props.logoUrl ?? null,
      isVerified: false,
      verifiedAt: null,
      averageRating: 0.0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
      hours: [],
      hourExceptions: [],
      media: [],
      promotions: [],
    });
  }

  public static reconstitute(props: SalonProps): SalonEntity {
    return new SalonEntity(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getSlug(): SalonSlug {
    return this.props.slug;
  }

  public getPhone(): string {
    return this.props.phone;
  }

  public getWhatsappPhone(): string | null {
    return this.props.whatsappPhone ?? null;
  }

  public getEmail(): string | null {
    return this.props.email ?? null;
  }

  public getDescription(): string | null {
    return this.props.description ?? null;
  }

  public getUniverse(): AppUniverseType {
    return this.props.universe;
  }

  public getStatus(): SalonStatusType {
    return this.props.status;
  }

  public getCommune(): string {
    return this.props.commune;
  }

  public getQuartier(): string {
    return this.props.quartier;
  }

  public getLandmark(): string {
    return this.props.landmark;
  }

  public getCoordinates(): SalonCoordinates {
    return this.props.coordinates;
  }

  public getAddress(): string | null {
    return this.props.address ?? null;
  }

  public getCoverUrl(): string | null {
    return this.props.coverUrl ?? null;
  }

  public getLogoUrl(): string | null {
    return this.props.logoUrl ?? null;
  }

  public isVerified(): boolean {
    return this.props.isVerified;
  }

  public getVerifiedAt(): Date | null {
    return this.props.verifiedAt ?? null;
  }

  public getAverageRating(): number {
    return this.props.averageRating;
  }

  public getReviewCount(): number {
    return this.props.reviewCount;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getExperienceConfig(): SalonExperienceConfigEntity | null {
    return this.props.experienceConfig ?? null;
  }

  public getHours(): SalonHourEntity[] {
    return this.props.hours ?? [];
  }

  public getHourExceptions(): SalonHourExceptionEntity[] {
    return this.props.hourExceptions ?? [];
  }

  public getMedia(): SalonMediaEntity[] {
    return this.props.media ?? [];
  }

  public getPromotions(): SalonPromotionEntity[] {
    return this.props.promotions ?? [];
  }

  // Setters de relations
  public setExperienceConfig(config: SalonExperienceConfigEntity | null): void {
    this.props.experienceConfig = config;
  }

  public setHours(hours: SalonHourEntity[]): void {
    this.props.hours = hours;
  }

  public setHourExceptions(exceptions: SalonHourExceptionEntity[]): void {
    this.props.hourExceptions = exceptions;
  }

  public setMedia(media: SalonMediaEntity[]): void {
    this.props.media = media;
  }

  public setPromotions(promotions: SalonPromotionEntity[]): void {
    this.props.promotions = promotions;
  }

  // Comportements métier
  public updateProfile(data: {
    name?: string;
    phone?: string;
    whatsappPhone?: string | null;
    email?: string | null;
    description?: string | null;
    universe?: AppUniverseType;
    commune?: string;
    quartier?: string;
    landmark?: string;
    coordinates?: SalonCoordinates;
    address?: string | null;
    coverUrl?: string | null;
    logoUrl?: string | null;
  }): void {
    if (data.name !== undefined) this.props.name = data.name.trim();
    if (data.phone !== undefined) this.props.phone = data.phone.trim();
    if (data.whatsappPhone !== undefined) this.props.whatsappPhone = data.whatsappPhone;
    if (data.email !== undefined) this.props.email = data.email;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.universe !== undefined) this.props.universe = data.universe;
    if (data.commune !== undefined) this.props.commune = data.commune.trim();
    if (data.quartier !== undefined) this.props.quartier = data.quartier.trim();
    if (data.landmark !== undefined) this.props.landmark = data.landmark.trim();
    if (data.coordinates !== undefined) this.props.coordinates = data.coordinates;
    if (data.address !== undefined) this.props.address = data.address;
    if (data.coverUrl !== undefined) this.props.coverUrl = data.coverUrl;
    if (data.logoUrl !== undefined) this.props.logoUrl = data.logoUrl;
    this.props.updatedAt = new Date();
  }

  public changeStatus(targetStatus: SalonStatusType): void {
    const current = this.props.status;
    if (current === targetStatus) return;

    // Règles de transitions valides
    const allowedTransitions: Record<SalonStatusType, SalonStatusType[]> = {
      DRAFT: ['PENDING_REVIEW', 'ARCHIVED'],
      PENDING_REVIEW: ['ACTIVE', 'DRAFT', 'SUSPENDED'],
      ACTIVE: ['SUSPENDED', 'ARCHIVED'],
      SUSPENDED: ['ACTIVE', 'ARCHIVED'],
      ARCHIVED: [], // État terminal
    };

    if (!allowedTransitions[current].includes(targetStatus)) {
      throw new InvalidSalonStatusTransitionException(current, targetStatus);
    }

    this.props.status = targetStatus;
    this.props.updatedAt = new Date();
  }

  public verify(): void {
    this.props.isVerified = true;
    this.props.verifiedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public unverify(): void {
    this.props.isVerified = false;
    this.props.verifiedAt = null;
    this.props.updatedAt = new Date();
  }

  public updateRating(newAverageRating: number, newReviewCount: number): void {
    this.props.averageRating = Math.max(0, Math.min(5, newAverageRating));
    this.props.reviewCount = Math.max(0, newReviewCount);
    this.props.updatedAt = new Date();
  }
}
