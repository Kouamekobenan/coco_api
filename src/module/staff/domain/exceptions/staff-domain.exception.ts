export class StaffDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaffDomainException';
  }
}

export class StaffNotFoundException extends StaffDomainException {
  constructor(id: string) {
    super(`Membre du personnel (Staff) "${id}" introuvable.`);
    this.name = 'StaffNotFoundException';
  }
}

export class StaffServiceNotFoundException extends StaffDomainException {
  constructor(id: string) {
    super(`Compétence de service staff "${id}" introuvable.`);
    this.name = 'StaffServiceNotFoundException';
  }
}

export class StaffBreakNotFoundException extends StaffDomainException {
  constructor(id: string) {
    super(`Pause programmée "${id}" introuvable.`);
    this.name = 'StaffBreakNotFoundException';
  }
}

export class StaffTimeOffNotFoundException extends StaffDomainException {
  constructor(id: string) {
    super(`Demande de congé/absence "${id}" introuvable.`);
    this.name = 'StaffTimeOffNotFoundException';
  }
}

export class ResourceNotFoundException extends StaffDomainException {
  constructor(id: string) {
    super(`Ressource physique du salon "${id}" introuvable.`);
    this.name = 'ResourceNotFoundException';
  }
}

export class InvalidWorkingHourException extends StaffDomainException {
  constructor(message: string) {
    super(`Horaires de travail invalides : ${message}`);
    this.name = 'InvalidWorkingHourException';
  }
}

export class InvalidTimeOffRangeException extends StaffDomainException {
  constructor() {
    super('La date de début du congé doit être antérieure à la date de fin.');
    this.name = 'InvalidTimeOffRangeException';
  }
}
