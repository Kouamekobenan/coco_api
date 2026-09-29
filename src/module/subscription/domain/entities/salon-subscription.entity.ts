export interface SalonSubscriptionProps {
  id: string;
  userId: string;
  salonId: string;
  notifyPromos: boolean;
  notifyStories: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Données dénormalisées ou jointes optionnelles pour affichage
  salonDetails?: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    coverUrl?: string | null;
    commune: string;
    quartier: string;
    averageRating: number;
    reviewCount: number;
  };

  userDetails?: {
    firstName?: string | null;
    lastName?: string | null;
    phone: string;
    avatarUrl?: string | null;
  };
}

export class SalonSubscriptionEntity {
  private constructor(private readonly props: SalonSubscriptionProps) {}

  public static create(props: {
    id: string;
    userId: string;
    salonId: string;
    notifyPromos?: boolean;
    notifyStories?: boolean;
  }): SalonSubscriptionEntity {
    const now = new Date();
    return new SalonSubscriptionEntity({
      id: props.id,
      userId: props.userId,
      salonId: props.salonId,
      notifyPromos: props.notifyPromos ?? true,
      notifyStories: props.notifyStories ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: SalonSubscriptionProps): SalonSubscriptionEntity {
    return new SalonSubscriptionEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public isNotifyPromos(): boolean {
    return this.props.notifyPromos;
  }

  public isNotifyStories(): boolean {
    return this.props.notifyStories;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getSalonDetails(): SalonSubscriptionProps['salonDetails'] {
    return this.props.salonDetails;
  }

  public getUserDetails(): SalonSubscriptionProps['userDetails'] {
    return this.props.userDetails;
  }

  public updatePreferences(notifyPromos?: boolean, notifyStories?: boolean): void {
    if (notifyPromos !== undefined) {
      this.props.notifyPromos = notifyPromos;
    }
    if (notifyStories !== undefined) {
      this.props.notifyStories = notifyStories;
    }
    this.props.updatedAt = new Date();
  }
}
