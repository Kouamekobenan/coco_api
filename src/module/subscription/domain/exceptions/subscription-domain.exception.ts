export class SubscriptionDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionDomainException';
  }
}

export class AlreadySubscribedException extends SubscriptionDomainException {
  constructor(salonId: string) {
    super(`L'utilisateur est déjà abonné au salon "${salonId}".`);
    this.name = 'AlreadySubscribedException';
  }
}

export class SubscriptionNotFoundException extends SubscriptionDomainException {
  constructor(salonId: string) {
    super(`Aucun abonnement trouvé pour ce salon "${salonId}".`);
    this.name = 'SubscriptionNotFoundException';
  }
}
