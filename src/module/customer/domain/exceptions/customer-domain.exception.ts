export class CustomerDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerDomainException';
  }
}

export class SalonCustomerNotFoundException extends CustomerDomainException {
  constructor(identifier: string) {
    super(`Fiche client "${identifier}" introuvable dans ce salon.`);
    this.name = 'SalonCustomerNotFoundException';
  }
}

export class SalonCustomerAlreadyExistsException extends CustomerDomainException {
  constructor(phone: string) {
    super(`Un client avec le numéro de téléphone "${phone}" existe déjà dans ce salon.`);
    this.name = 'SalonCustomerAlreadyExistsException';
  }
}

export class CustomerNoteNotFoundException extends CustomerDomainException {
  constructor(noteId: string) {
    super(`Note / Fiche technique "${noteId}" introuvable.`);
    this.name = 'CustomerNoteNotFoundException';
  }
}
