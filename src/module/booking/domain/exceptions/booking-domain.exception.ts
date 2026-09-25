export class BookingDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingDomainException';
  }
}

export class BookingNotFoundException extends BookingDomainException {
  constructor(identifier: string) {
    super(`Réservation "${identifier}" introuvable.`);
    this.name = 'BookingNotFoundException';
  }
}

export class BookingSlotUnavailableException extends BookingDomainException {
  constructor(message = 'Ce créneau horaire n\'est plus disponible pour le coiffeur ou la ressource sélectionnée.') {
    super(message);
    this.name = 'BookingSlotUnavailableException';
  }
}

export class InvalidBookingStatusTransitionException extends BookingDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition d'état de réservation non autorisée de "${currentStatus}" vers "${targetStatus}".`);
    this.name = 'InvalidBookingStatusTransitionException';
  }
}

export class BookingHoldExpiredException extends BookingDomainException {
  constructor() {
    super('Le verrouillage temporaire de cette réservation pour paiement d\'acompte a expiré.');
    this.name = 'BookingHoldExpiredException';
  }
}

export class BookingPhaseNotFoundException extends BookingDomainException {
  constructor(phaseId: string) {
    super(`Phase de réservation "${phaseId}" introuvable.`);
    this.name = 'BookingPhaseNotFoundException';
  }
}
