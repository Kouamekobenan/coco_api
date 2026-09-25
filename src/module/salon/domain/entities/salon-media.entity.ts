export interface SalonMediaProps {
  id: string;
  salonId: string;
  url: string;
  mediaType: string; // 'IMAGE' | 'VIDEO'
  category: string;  // 'SHOWCASE' | 'TEAM' | 'STYLE'
  sortOrder: number;
  createdAt: Date;
}

export class SalonMediaEntity {
  private constructor(private readonly props: SalonMediaProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    url: string;
    mediaType?: string;
    category?: string;
    sortOrder?: number;
  }): SalonMediaEntity {
    return new SalonMediaEntity({
      id: props.id,
      salonId: props.salonId,
      url: props.url,
      mediaType: props.mediaType ?? 'IMAGE',
      category: props.category ?? 'SHOWCASE',
      sortOrder: props.sortOrder ?? 0,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: SalonMediaProps): SalonMediaEntity {
    return new SalonMediaEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getUrl(): string {
    return this.props.url;
  }

  public getMediaType(): string {
    return this.props.mediaType;
  }

  public getCategory(): string {
    return this.props.category;
  }

  public getSortOrder(): number {
    return this.props.sortOrder;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public updateSortOrder(order: number): void {
    this.props.sortOrder = order;
  }
}
