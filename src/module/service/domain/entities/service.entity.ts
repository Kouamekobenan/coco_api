import { AppUniverseType, StyleEntity } from './style.entity.js';
import { ServiceVariantEntity } from './service-variant.entity.js';

export interface ServiceProps {
  id: string;
  salonId: string;
  styleId?: string | null;
  name: string;
  description?: string | null;
  universe: AppUniverseType;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations chargées
  style?: StyleEntity | null;
  variants?: ServiceVariantEntity[];
}

export class ServiceEntity {
  private constructor(private readonly props: ServiceProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    styleId?: string | null;
    name: string;
    description?: string | null;
    universe?: AppUniverseType;
    sortOrder?: number;
  }): ServiceEntity {
    const now = new Date();
    return new ServiceEntity({
      id: props.id,
      salonId: props.salonId,
      styleId: props.styleId ?? null,
      name: props.name.trim(),
      description: props.description ?? null,
      universe: props.universe ?? 'COCOMOUSSO',
      isActive: true,
      sortOrder: props.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      variants: [],
    });
  }

  public static reconstitute(props: ServiceProps): ServiceEntity {
    return new ServiceEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getStyleId(): string | null {
    return this.props.styleId ?? null;
  }

  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string | null {
    return this.props.description ?? null;
  }

  public getUniverse(): AppUniverseType {
    return this.props.universe;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getSortOrder(): number {
    return this.props.sortOrder;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getStyle(): StyleEntity | null {
    return this.props.style ?? null;
  }

  public getVariants(): ServiceVariantEntity[] {
    return this.props.variants ?? [];
  }

  public setStyle(style: StyleEntity | null): void {
    this.props.style = style;
    this.props.styleId = style ? style.getId() : null;
    this.props.updatedAt = new Date();
  }

  public setVariants(variants: ServiceVariantEntity[]): void {
    this.props.variants = variants;
  }

  public addVariant(variant: ServiceVariantEntity): void {
    if (!this.props.variants) this.props.variants = [];
    this.props.variants.push(variant);
    this.props.updatedAt = new Date();
  }

  public update(props: {
    name?: string;
    styleId?: string | null;
    description?: string | null;
    universe?: AppUniverseType;
    isActive?: boolean;
    sortOrder?: number;
  }): void {
    if (props.name !== undefined) this.props.name = props.name.trim();
    if (props.styleId !== undefined) this.props.styleId = props.styleId;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.universe !== undefined) this.props.universe = props.universe;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    if (props.sortOrder !== undefined) this.props.sortOrder = props.sortOrder;
    this.props.updatedAt = new Date();
  }
}
