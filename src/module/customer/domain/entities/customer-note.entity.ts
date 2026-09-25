export interface CustomerNoteProps {
  id: string;
  salonId: string;
  salonCustomerId: string;
  authorId: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerNoteEntity {
  private constructor(private readonly props: CustomerNoteProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    salonCustomerId: string;
    authorId: string;
    content: string;
    isPrivate?: boolean;
  }): CustomerNoteEntity {
    const now = new Date();
    return new CustomerNoteEntity({
      id: props.id,
      salonId: props.salonId,
      salonCustomerId: props.salonCustomerId,
      authorId: props.authorId,
      content: props.content.trim(),
      isPrivate: props.isPrivate ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: CustomerNoteProps): CustomerNoteEntity {
    return new CustomerNoteEntity(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSalonId(): string {
    return this.props.salonId;
  }

  public getSalonCustomerId(): string {
    return this.props.salonCustomerId;
  }

  public getAuthorId(): string {
    return this.props.authorId;
  }

  public getContent(): string {
    return this.props.content;
  }

  public isPrivate(): boolean {
    return this.props.isPrivate;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(content: string, isPrivate?: boolean): void {
    this.props.content = content.trim();
    if (isPrivate !== undefined) this.props.isPrivate = isPrivate;
    this.props.updatedAt = new Date();
  }
}
