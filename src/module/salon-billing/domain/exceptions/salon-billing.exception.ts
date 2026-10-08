import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export class SalonBillingDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalonBillingDomainException';
  }
}

export class PlanQuotaExceededException extends ForbiddenException {
  constructor(resource: 'STAFF' | 'SERVICE', current: number, max: number) {
    const resourceLabel = resource === 'STAFF' ? 'coiffeurs' : 'prestations';
    super(
      `Limite de votre formule atteinte (${current}/${max} ${resourceLabel}). Veuillez mettre à niveau votre abonnement (Starter ou Business Pro) pour débloquer davantage.`,
    );
  }
}

export class SalonSubscriptionExpiredException extends ForbiddenException {
  constructor(salonId: string) {
    super(
      `L'abonnement du salon (${salonId}) a expiré. Veuillez régulariser votre abonnement pour continuer à utiliser la plateforme.`,
    );
  }
}

export class SalonBillingSubscriptionNotFoundException extends NotFoundException {
  constructor(salonId: string) {
    super(`Aucun abonnement trouvé pour le salon ${salonId}.`);
  }
}

export class SalonPlanNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Le forfait demandé (${identifier}) est introuvable.`);
  }
}
