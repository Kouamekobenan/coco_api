export type ResourceType = 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL';

export interface ResourceProps {
  id: string;
  salonId: string;
  name: string;
  type: ResourceType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceEntity {
  private constructor(private readonly props: ResourceProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    name: string;
    type?: ResourceType;
  }): ResourceEntity {
    const now = new Date();
    return new ResourceEntity({
      id: props.id,
      salonId: props.salonId,
      name: props.name.trim(),
      type: props.type ?? 'SEAT',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ResourceProps): ResourceEntity {
    return new ResourceEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getName(): string {
    return this.props.name;
  }

  public getType(): ResourceType {
    return this.props.type;
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

  public update(props: { name?: string; type?: ResourceType; isActive?: boolean }): void {
    if (props.name !== undefined) this.props.name = props.name.trim();
    if (props.type !== undefined) this.props.type = props.type;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
