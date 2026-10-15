export const REVIEW_EVENT_PATTERNS = {
  SALON_REVIEWED: 'review.salon_reviewed',
  CLIENT_REVIEWED: 'review.client_reviewed',
} as const;

/** Un client vient de noter un salon. */
export class SalonReviewedEvent {
  constructor(
    public readonly reviewId: string,
    public readonly salonId: string,
    public readonly bookingId: string,
    public readonly reviewerId: string,
    public readonly rating: number,
    public readonly comment: string | null,
  ) {}
}

/** Le propriétaire d'un salon vient de noter un client. */
export class ClientReviewedEvent {
  constructor(
    public readonly reviewId: string,
    public readonly salonId: string,
    public readonly bookingId: string,
    public readonly clientId: string,
    public readonly rating: number,
    public readonly comment: string | null,
  ) {}
}
