export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidPhoneNumberException extends DomainException {
  constructor(phone: string) {
    super(
      `Le format du numéro de téléphone "${phone}" est invalide pour la Côte d'Ivoire. Formats acceptés : +225XXXXXXXXXX ou 10 chiffres (ex: 07XXXXXXXX, 05XXXXXXXX, 01XXXXXXXX).`,
    );
    this.name = 'InvalidPhoneNumberException';
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(reason: string) {
    super(`Mot de passe invalide : ${reason}`);
    this.name = 'InvalidPasswordException';
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(phone: string) {
    super(`Un compte avec le numéro de téléphone "${phone}" existe déjà.`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Utilisateur "${identifier}" introuvable.`);
    this.name = 'UserNotFoundException';
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Identifiants invalides (numéro de téléphone ou mot de passe incorrect).');
    this.name = 'InvalidCredentialsException';
  }
}
