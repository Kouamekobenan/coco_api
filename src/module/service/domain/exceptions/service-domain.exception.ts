export class ServiceDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceDomainException';
  }
}

export class ServiceNotFoundException extends ServiceDomainException {
  constructor(id: string) {
    super(`Prestation / Service "${id}" introuvable.`);
    this.name = 'ServiceNotFoundException';
  }
}

export class StyleNotFoundException extends ServiceDomainException {
  constructor(identifier: string) {
    super(`Style de coiffure "${identifier}" introuvable.`);
    this.name = 'StyleNotFoundException';
  }
}

export class StyleSlugAlreadyExistsException extends ServiceDomainException {
  constructor(slug: string) {
    super(`Un style avec le slug "${slug}" existe déjà.`);
    this.name = 'StyleSlugAlreadyExistsException';
  }
}

export class ServiceVariantNotFoundException extends ServiceDomainException {
  constructor(id: string) {
    super(`Variante de prestation "${id}" introuvable.`);
    this.name = 'ServiceVariantNotFoundException';
  }
}

export class InvalidServiceDurationsException extends ServiceDomainException {
  constructor(min: number, estimated: number, max: number) {
    super(
      `Durées de prestation invalides : la durée minimale (${min}m) doit être <= estimée (${estimated}m) <= maximale (${max}m).`,
    );
    this.name = 'InvalidServiceDurationsException';
  }
}

export class InvalidServicePriceException extends ServiceDomainException {
  constructor(message: string) {
    super(`Tarif invalide : ${message}`);
    this.name = 'InvalidServicePriceException';
  }
}
