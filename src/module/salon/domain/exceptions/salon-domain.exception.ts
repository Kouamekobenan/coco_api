export class SalonDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalonDomainException';
  }
}

// Alias pour compatibilité
export { SalonDomainException as DomainException };

export class InvalidSalonSlugException extends SalonDomainException {
  constructor(slug: string) {
    super(
      `Le slug de salon "${slug}" est invalide. Il ne doit contenir que des lettres minuscules, chiffres et tirets (ex: "salon-elegance-cocody").`,
    );
    this.name = 'InvalidSalonSlugException';
  }
}

export class InvalidCoordinatesException extends SalonDomainException {
  constructor(lat: number, lng: number) {
    super(
      `Coordonnées géographiques invalides : latitude=${lat}, longitude=${lng}. La latitude doit être entre -90 et 90 et la longitude entre -180 et 180.`,
    );
    this.name = 'InvalidCoordinatesException';
  }
}

export class SalonNotFoundException extends SalonDomainException {
  constructor(identifier: string) {
    super(`Salon "${identifier}" introuvable.`);
    this.name = 'SalonNotFoundException';
  }
}

export class SalonSlugAlreadyExistsException extends SalonDomainException {
  constructor(slug: string) {
    super(`Un salon avec le slug "${slug}" existe déjà. Veuillez choisir un autre nom ou slug.`);
    this.name = 'SalonSlugAlreadyExistsException';
  }
}

export class InvalidSalonStatusTransitionException extends SalonDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition de statut de salon non autorisée de "${currentStatus}" vers "${targetStatus}".`);
    this.name = 'InvalidSalonStatusTransitionException';
  }
}

export class SalonMediaNotFoundException extends SalonDomainException {
  constructor(mediaId: string) {
    super(`Média de salon "${mediaId}" introuvable.`);
    this.name = 'SalonMediaNotFoundException';
  }
}

export class SalonPromotionNotFoundException extends SalonDomainException {
  constructor(promotionId: string) {
    super(`Promotion de salon "${promotionId}" introuvable.`);
    this.name = 'SalonPromotionNotFoundException';
  }
}

export class SalonHourExceptionNotFoundException extends SalonDomainException {
  constructor(exceptionId: string) {
    super(`Exception d'horaire "${exceptionId}" introuvable.`);
    this.name = 'SalonHourExceptionNotFoundException';
  }
}

export class UnauthorizedSalonAccessException extends SalonDomainException {
  constructor(message = 'Accès non autorisé aux paramètres de ce salon.') {
    super(message);
    this.name = 'UnauthorizedSalonAccessException';
  }
}
