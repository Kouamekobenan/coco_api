export class QueueDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueueDomainException';
  }
}

export class QueueTicketNotFoundException extends QueueDomainException {
  constructor(identifier: string) {
    super(`Ticket de file d'attente "${identifier}" introuvable.`);
    this.name = 'QueueTicketNotFoundException';
  }
}

export class InvalidQueueStatusTransitionException extends QueueDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition non autorisée du statut de ticket "${currentStatus}" vers "${targetStatus}".`);
    this.name = 'InvalidQueueStatusTransitionException';
  }
}

export class ActiveTicketAlreadyExistsException extends QueueDomainException {
  constructor(customerId: string) {
    super(`Le client "${customerId}" possède déjà un ticket actif dans la file d'attente.`);
    this.name = 'ActiveTicketAlreadyExistsException';
  }
}

export class QueueCallExpiredException extends QueueDomainException {
  constructor() {
    super('Le délai imparti pour répondre à l\'appel du ticket a expiré.');
    this.name = 'QueueCallExpiredException';
  }
}

export class InvalidTicketNumberFormatException extends QueueDomainException {
  constructor(ticketNumber: string) {
    super(`Le format du numéro de ticket "${ticketNumber}" est invalide (attendu: W-001 ou A-001).`);
    this.name = 'InvalidTicketNumberFormatException';
  }
}
