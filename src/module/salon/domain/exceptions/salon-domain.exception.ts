export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidSalonSlugException extends DomainException {
  constructor(slug: string) {
    super(
      `Le slug de salon "${slug}" est invalide. Il ne doit contenir que des lettres minuscules, chiffres et tirets (ex: "salon-elegance-cocody").`,
    );
    this.name = 'InvalidSalonSlugException';
  }
}

export class InvalidCoordinatesException extends DomainException {
  constructor(lat: number, lng: number) {
    super(
      `Coordonnées géographiques invalides : latitude=${lat}, longitude=${lng}. La latitude doit être entre -90 et 90 et la longitude entre -180 et 180.`,
    );
    this.name = 'InvalidCoordinatesException';
  }
}

export class SalonNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Salon "${identifier}" introuvable.`);
    this.name = 'SalonNotFoundException';
  }
}

export class SalonSlugAlreadyExistsException extends DomainException {
  constructor(slug: string) {
    super(`Un salon avec le slug "${slug}" existe déjà. Veuillez choisir un autre nom ou slug.`);
    this.name = 'SalonSlugAlreadyExistsException';
  }
}

export class InvalidSalonStatusTransitionException extends DomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition de statut de salon non autorisée de "${currentStatus}" vers "${targetStatus}".`);
    this.name = 'InvalidSalonStatusTransitionException';
  }
}

export class SalonMediaNotFoundException extends DomainException {
  constructor(mediaId: string) {
    super(`Média de salon "${mediaId}" introuvable.`);
    this.name = 'SalonMediaNotFoundException';
  }
}

export class SalonPromotionNotFoundException extends DomainException {
  constructor(promotionId: string) {
    super(`Promotion de salon "${promotionId}" introuvable.`);
    this.name = 'SalonPromotionNotFoundException';
  }
}

export class SalonHourExceptionNotFoundException extends DomainException {
  constructor(exceptionId: string) {
    super(`Exception d'horaire "${exceptionId}" introuvable.`);
    this.name = 'SalonHourExceptionNotFoundException';
  }
}

export class UnauthorizedSalonAccessException extends DomainException {
  constructor(message = 'Accès non autorisé aux paramètres de ce salon.') {
    super(message);
    this.name = 'UnauthorizedSalonAccessException';
  }
}
