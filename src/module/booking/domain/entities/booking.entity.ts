import { BookingStatus } from '@prisma/client';
import { BookingTimeSlot } from '../value-objects/booking-time-slot.vo.js';
import { BookingPhaseEntity } from './booking-phase.entity.js';
import {
  InvalidBookingStatusTransitionException,
  BookingHoldExpiredException,
} from '../exceptions/booking-domain.exception.js';

export interface BookingProps {
  id: string;
  idempotencyKey: string;
  salonId: string;
  customerId: string;
  userId?: string | null;
  variantId: string;
  staffId?: string | null;
  status: BookingStatus;
  timeSlot: BookingTimeSlot;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  delayMinutes?: number;
  isDelayAlertSent?: boolean;
  depositAmount: number;
  totalPrice: number;
  isDepositPaid?: boolean;
  depositPaidAt?: Date | null;
  holdExpiresAt?: Date | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  rescheduledFromId?: string | null;
  clientNotes?: string | null;
  phases?: BookingPhaseEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookingEntity {
  private _props: BookingProps;

  constructor(props: BookingProps) {
    this._props = {
      ...props,
      userId: props.userId ?? null,
      staffId: props.staffId ?? null,
      actualStart: props.actualStart ?? null,
      actualEnd: props.actualEnd ?? null,
      delayMinutes: props.delayMinutes ?? 0,
      isDelayAlertSent: props.isDelayAlertSent ?? false,
      isDepositPaid: props.isDepositPaid ?? false,
      depositPaidAt: props.depositPaidAt ?? null,
      holdExpiresAt: props.holdExpiresAt ?? null,
      cancellationReason: props.cancellationReason ?? null,
      cancelledAt: props.cancelledAt ?? null,
      rescheduledFromId: props.rescheduledFromId ?? null,
      clientNotes: props.clientNotes ?? null,
      phases: props.phases ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get idempotencyKey(): string {
    return this._props.idempotencyKey;
  }

  public get salonId(): string {
    return this._props.salonId;
  }

  public get customerId(): string {
    return this._props.customerId;
  }

  public get userId(): string | null {
    return this._props.userId ?? null;
  }

  public get variantId(): string {
    return this._props.variantId;
  }

  public get staffId(): string | null {
    return this._props.staffId ?? null;
  }

  public get status(): BookingStatus {
    return this._props.status;
  }

  public get timeSlot(): BookingTimeSlot {
    return this._props.timeSlot;
  }

  public get scheduledStart(): Date {
    return this._props.timeSlot.scheduledStart;
  }

  public get projectedEnd(): Date {
    return this._props.timeSlot.projectedEnd;
  }

  public get worstCaseEnd(): Date {
    return this._props.timeSlot.worstCaseEnd;
  }

  public get actualStart(): Date | null {
    return this._props.actualStart ?? null;
  }

  public get actualEnd(): Date | null {
    return this._props.actualEnd ?? null;
  }

  public get delayMinutes(): number {
    return this._props.delayMinutes ?? 0;
  }

  public get isDelayAlertSent(): boolean {
    return this._props.isDelayAlertSent ?? false;
  }

  public get depositAmount(): number {
    return this._props.depositAmount;
  }

  public get totalPrice(): number {
    return this._props.totalPrice;
  }

  public get isDepositPaid(): boolean {
    return this._props.isDepositPaid ?? false;
  }

  public get depositPaidAt(): Date | null {
    return this._props.depositPaidAt ?? null;
  }

  public get holdExpiresAt(): Date | null {
    return this._props.holdExpiresAt ?? null;
  }

  public get cancellationReason(): string | null {
    return this._props.cancellationReason ?? null;
  }

  public get cancelledAt(): Date | null {
    return this._props.cancelledAt ?? null;
  }

  public get rescheduledFromId(): string | null {
    return this._props.rescheduledFromId ?? null;
  }

  public get clientNotes(): string | null {
    return this._props.clientNotes ?? null;
  }

  public get phases(): BookingPhaseEntity[] {
    return [...(this._props.phases ?? [])];
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public isHoldExpired(now: Date = new Date()): boolean {
    if (!this._props.holdExpiresAt) return false;
    return this._props.status === BookingStatus.PENDING_DEPOSIT && now > this._props.holdExpiresAt;
  }

  public confirmDeposit(paidAt: Date = new Date()): void {
    if (this._props.status !== BookingStatus.PENDING_DEPOSIT && this._props.status !== BookingStatus.DRAFT) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.CONFIRMED);
    }
    if (this.isHoldExpired(paidAt)) {
      this._props.status = BookingStatus.EXPIRED;
      throw new BookingHoldExpiredException();
    }
    this._props.isDepositPaid = true;
    this._props.depositPaidAt = paidAt;
    this._props.holdExpiresAt = null;
    this._props.status = BookingStatus.CONFIRMED;
    this._props.updatedAt = new Date();
  }

  public checkIn(): void {
    if (this._props.status !== BookingStatus.CONFIRMED) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.CHECKED_IN);
    }
    this._props.status = BookingStatus.CHECKED_IN;
    this._props.updatedAt = new Date();
  }

  public start(actualStart: Date = new Date()): void {
    if (
      this._props.status !== BookingStatus.CHECKED_IN &&
      this._props.status !== BookingStatus.CONFIRMED
    ) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.IN_PROGRESS);
    }
    this._props.status = BookingStatus.IN_PROGRESS;
    this._props.actualStart = actualStart;
    this._props.updatedAt = new Date();
  }

  public complete(actualEnd: Date = new Date()): void {
    if (this._props.status !== BookingStatus.IN_PROGRESS) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.COMPLETED);
    }
    this._props.status = BookingStatus.COMPLETED;
    this._props.actualEnd = actualEnd;
    this._props.updatedAt = new Date();
  }

  public cancel(reason?: string, cancelledAt: Date = new Date()): void {
    if (this._props.status === BookingStatus.COMPLETED) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.CANCELLED);
    }
    this._props.status = BookingStatus.CANCELLED;
    this._props.cancellationReason = reason ?? null;
    this._props.cancelledAt = cancelledAt;
    this._props.updatedAt = new Date();
  }

  public markNoShow(): void {
    if (
      this._props.status !== BookingStatus.CONFIRMED &&
      this._props.status !== BookingStatus.CHECKED_IN
    ) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.NO_SHOW);
    }
    this._props.status = BookingStatus.NO_SHOW;
    this._props.updatedAt = new Date();
  }

  public requestReschedule(): void {
    if (this._props.status !== BookingStatus.CONFIRMED) {
      throw new InvalidBookingStatusTransitionException(this._props.status, BookingStatus.RESCHEDULE_REQUESTED);
    }
    this._props.status = BookingStatus.RESCHEDULE_REQUESTED;
    this._props.updatedAt = new Date();
  }

  public updateDelay(delayMinutes: number, alertSent = false): void {
    this._props.delayMinutes = delayMinutes;
    this._props.isDelayAlertSent = alertSent;

    // Shift projected and worst-case end times
    const shiftMs = delayMinutes * 60 * 1000;
    const newProjected = new Date(this._props.timeSlot.projectedEnd.getTime() + shiftMs);
    const newWorstCase = new Date(this._props.timeSlot.worstCaseEnd.getTime() + shiftMs);

    this._props.timeSlot = new BookingTimeSlot(
      this._props.timeSlot.scheduledStart,
      newProjected,
      newWorstCase,
    );
    this._props.updatedAt = new Date();
  }

  public assignStaff(staffId: string | null): void {
    this._props.staffId = staffId;
    this._props.updatedAt = new Date();
  }

  public updateNotes(notes: string): void {
    this._props.clientNotes = notes;
    this._props.updatedAt = new Date();
  }

  public addPhase(phase: BookingPhaseEntity): void {
    this._props.phases = [...(this._props.phases ?? []), phase];
    this._props.updatedAt = new Date();
  }

  public removePhase(phaseId: string): void {
    this._props.phases = (this._props.phases ?? []).filter((p) => p.id !== phaseId);
    this._props.updatedAt = new Date();
  }
}
