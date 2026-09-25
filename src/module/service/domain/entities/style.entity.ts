export type AppUniverseType = 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

export interface StyleProps {
  id: string;
  name: string;
  slug: string;
  universe: AppUniverseType;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StyleEntity {
  private constructor(private readonly props: StyleProps) {}

  public static create(props: {
    id: string;
    name: string;
    slug: string;
    universe?: AppUniverseType;
    description?: string | null;
    imageUrl?: string | null;
  }): StyleEntity {
    const now = new Date();
    return new StyleEntity({
      id: props.id,
      name: props.name.trim(),
      slug: props.slug.trim().toLowerCase(),
      universe: props.universe ?? 'COCOMOUSSO',
      description: props.description ?? null,
      imageUrl: props.imageUrl ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: StyleProps): StyleEntity {
    return new StyleEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getSlug(): string {
    return this.props.slug;
  }

  public getUniverse(): AppUniverseType {
    return this.props.universe;
  }

  public getDescription(): string | null {
    return this.props.description ?? null;
  }

  public getImageUrl(): string | null {
    return this.props.imageUrl ?? null;
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

  public update(props: {
    name?: string;
    universe?: AppUniverseType;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) this.props.name = props.name.trim();
    if (props.universe !== undefined) this.props.universe = props.universe;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.imageUrl !== undefined) this.props.imageUrl = props.imageUrl;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
