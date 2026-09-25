import { QueueTicketStatus, QueueType } from '@prisma/client';
import { TicketNumber } from '../value-objects/ticket-number.vo.js';
import { QueueWaitEstimate } from '../value-objects/queue-wait-estimate.vo.js';
import { InvalidQueueStatusTransitionException } from '../exceptions/queue-domain.exception.js';

export interface QueueTicketProps {
  id: string;
  salonId: string;
  customerId: string;
  bookingId?: string | null;
  queueType: QueueType;
  ticketNumber: TicketNumber;
  status: QueueTicketStatus;
  estimate: QueueWaitEstimate;
  calledAt?: Date | null;
  callDeadlineAt?: Date | null;
  servedAt?: Date | null;
  completedAt?: Date | null;
  qrCodeToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class QueueTicketEntity {
  private _props: QueueTicketProps;

  constructor(props: QueueTicketProps) {
    this._props = {
      ...props,
      bookingId: props.bookingId ?? null,
      calledAt: props.calledAt ?? null,
      callDeadlineAt: props.callDeadlineAt ?? null,
      servedAt: props.servedAt ?? null,
      completedAt: props.completedAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._props.id;
  }

  public get salonId(): string {
    return this._props.salonId;
  }

  public get customerId(): string {
    return this._props.customerId;
  }

  public get bookingId(): string | null {
    return this._props.bookingId ?? null;
  }

  public get queueType(): QueueType {
    return this._props.queueType;
  }

  public get ticketNumber(): TicketNumber {
    return this._props.ticketNumber;
  }

  public get status(): QueueTicketStatus {
    return this._props.status;
  }

  public get estimate(): QueueWaitEstimate {
    return this._props.estimate;
  }

  public get calledAt(): Date | null {
    return this._props.calledAt ?? null;
  }

  public get callDeadlineAt(): Date | null {
    return this._props.callDeadlineAt ?? null;
  }

  public get servedAt(): Date | null {
    return this._props.servedAt ?? null;
  }

  public get completedAt(): Date | null {
    return this._props.completedAt ?? null;
  }

  public get qrCodeToken(): string {
    return this._props.qrCodeToken;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public isCallDeadlineExpired(now: Date = new Date()): boolean {
    if (this._props.status !== QueueTicketStatus.CALLED || !this._props.callDeadlineAt) {
      return false;
    }
    return now > this._props.callDeadlineAt;
  }

  public call(graceMinutes = 10, now: Date = new Date()): void {
    if (this._props.status !== QueueTicketStatus.WAITING) {
      throw new InvalidQueueStatusTransitionException(
        this._props.status,
        QueueTicketStatus.CALLED,
      );
    }
    this._props.status = QueueTicketStatus.CALLED;
    this._props.calledAt = now;
    this._props.callDeadlineAt = new Date(now.getTime() + graceMinutes * 60 * 1000);
    this._props.updatedAt = new Date();
  }

  public startService(now: Date = new Date()): void {
    if (
      this._props.status !== QueueTicketStatus.CALLED &&
      this._props.status !== QueueTicketStatus.WAITING
    ) {
      throw new InvalidQueueStatusTransitionException(
        this._props.status,
        QueueTicketStatus.IN_SERVICE,
      );
    }
    this._props.status = QueueTicketStatus.IN_SERVICE;
    this._props.servedAt = now;
    this._props.updatedAt = new Date();
  }

  public complete(now: Date = new Date()): void {
    if (this._props.status !== QueueTicketStatus.IN_SERVICE) {
      throw new InvalidQueueStatusTransitionException(
        this._props.status,
        QueueTicketStatus.DONE,
      );
    }
    this._props.status = QueueTicketStatus.DONE;
    this._props.completedAt = now;
    this._props.updatedAt = new Date();
  }

  public markLeft(): void {
    if (
      this._props.status !== QueueTicketStatus.WAITING &&
      this._props.status !== QueueTicketStatus.CALLED
    ) {
      throw new InvalidQueueStatusTransitionException(
        this._props.status,
        QueueTicketStatus.LEFT,
      );
    }
    this._props.status = QueueTicketStatus.LEFT;
    this._props.updatedAt = new Date();
  }

  public markNoShow(): void {
    if (this._props.status !== QueueTicketStatus.CALLED) {
      throw new InvalidQueueStatusTransitionException(
        this._props.status,
        QueueTicketStatus.NO_SHOW,
      );
    }
    this._props.status = QueueTicketStatus.NO_SHOW;
    this._props.updatedAt = new Date();
  }

  public updateEstimate(estimate: QueueWaitEstimate): void {
    this._props.estimate = estimate;
    this._props.updatedAt = new Date();
  }
}
