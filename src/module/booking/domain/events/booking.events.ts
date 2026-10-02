export const BOOKING_EVENT_PATTERNS = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_DEPOSIT_CONFIRMED: 'booking.deposit_confirmed',
  BOOKING_CHECKED_IN: 'booking.checked_in',
  BOOKING_STARTED: 'booking.started',
  BOOKING_COMPLETED: 'booking.completed',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_NO_SHOW: 'booking.no_show',
  BOOKING_EXPIRED: 'booking.expired',
  BOOKING_DELAY_UPDATED: 'booking.delay_updated',
} as const;

export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly requiresDeposit: boolean,
    public readonly holdExpiresAt?: Date | null,
    public readonly scheduledStart?: Date,
    public readonly createdAt: Date = new Date(),
  ) {}
}

export class BookingDepositConfirmedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly depositAmount: number,
    public readonly paidAt: Date = new Date(),
  ) {}
}

export class BookingCheckedInEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly checkedInAt: Date = new Date(),
  ) {}
}

export class BookingStartedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly startedAt: Date = new Date(),
  ) {}
}

export class BookingCompletedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly totalPrice: number,
    public readonly completedAt: Date = new Date(),
  ) {}
}

export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly reason?: string | null,
    public readonly cancelledAt: Date = new Date(),
  ) {}
}

export class BookingNoShowEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly markedAt: Date = new Date(),
  ) {}
}

export class BookingHoldExpiredEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly expiredAt: Date = new Date(),
  ) {}
}

export class BookingDelayUpdatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly salonId: string,
    public readonly customerId: string,
    public readonly delayMinutes: number,
    public readonly isAlertSent: boolean,
    public readonly updatedAt: Date = new Date(),
  ) {}
}
