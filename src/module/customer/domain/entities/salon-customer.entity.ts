import { CustomerNoteEntity } from './customer-note.entity.js';

export type CustomerSegmentType = 'NEW' | 'REGULAR' | 'INACTIVE' | 'VIP';

export interface SalonCustomerProps {
  id: string;
  salonId: string;
  userId?: string | null;
  phone: string;
  name: string;
  email?: string | null;

  segment: CustomerSegmentType;
  visitCount: number;
  totalSpent: number; // en FCFA
  lastVisitAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  notes?: CustomerNoteEntity[];
}

export class SalonCustomerEntity {
  private constructor(private readonly props: SalonCustomerProps) {}

  public static create(props: {
    id: string;
    salonId: string;
    userId?: string | null;
    phone: string;
    name: string;
    email?: string | null;
    segment?: CustomerSegmentType;
  }): SalonCustomerEntity {
    const now = new Date();
    return new SalonCustomerEntity({
      id: props.id,
      salonId: props.salonId,
      userId: props.userId ?? null,
      phone: props.phone.trim(),
      name: props.name.trim(),
      email: props.email ?? null,
      segment: props.segment ?? 'NEW',
      visitCount: 0,
      totalSpent: 0,
      lastVisitAt: null,
      createdAt: now,
      updatedAt: now,
      notes: [],
    });
  }

  public static reconstitute(props: SalonCustomerProps): SalonCustomerEntity {
    return new SalonCustomerEntity(props);
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

  public getPhone(): string {
    return this.props.phone;
  }

  public getName(): string {
    return this.props.name;
  }

  public getEmail(): string | null {
    return this.props.email ?? null;
  }

  public getSegment(): CustomerSegmentType {
    return this.props.segment;
  }

  public getVisitCount(): number {
    return this.props.visitCount;
  }

  public getTotalSpent(): number {
    return this.props.totalSpent;
  }

  public getLastVisitAt(): Date | null {
    return this.props.lastVisitAt ?? null;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getNotes(): CustomerNoteEntity[] {
    return this.props.notes ?? [];
  }

  public setNotes(notes: CustomerNoteEntity[]): void {
    this.props.notes = notes;
  }

  public addNote(note: CustomerNoteEntity): void {
    if (!this.props.notes) this.props.notes = [];
    this.props.notes.unshift(note);
    this.props.updatedAt = new Date();
  }

  public linkUser(userId: string): void {
    this.props.userId = userId;
    this.props.updatedAt = new Date();
  }

  public updateProfile(data: { name?: string; email?: string | null; phone?: string }): void {
    if (data.name !== undefined) this.props.name = data.name.trim();
    if (data.email !== undefined) this.props.email = data.email ? data.email.trim() : null;
    if (data.phone !== undefined) this.props.phone = data.phone.trim();
    this.props.updatedAt = new Date();
  }

  public changeSegment(segment: CustomerSegmentType): void {
    this.props.segment = segment;
    this.props.updatedAt = new Date();
  }

  /**
   * Enregistre une visite terminée et met à jour automatiquement la segmentation
   */
  public recordVisit(spentAmount: number, visitDate: Date = new Date()): void {
    this.props.visitCount += 1;
    this.props.totalSpent += Math.max(0, spentAmount);
    this.props.lastVisitAt = visitDate;

    // Segmentation automatique intelligente
    if (this.props.totalSpent >= 100000 || this.props.visitCount >= 6) {
      this.props.segment = 'VIP';
    } else if (this.props.visitCount >= 2) {
      this.props.segment = 'REGULAR';
    } else {
      this.props.segment = 'NEW';
    }

    this.props.updatedAt = new Date();
  }
}
