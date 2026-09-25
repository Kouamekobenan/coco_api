export class PaymentDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentDomainException';
  }
}

export class PaymentNotFoundException extends PaymentDomainException {
  constructor(identifier: string) {
    super(`Paiement "${identifier}" introuvable.`);
    this.name = 'PaymentNotFoundException';
  }
}

export class InvalidPaymentStatusTransitionException extends PaymentDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition non autorisée du statut de paiement "${currentStatus}" vers "${targetStatus}".`);
    this.name = 'InvalidPaymentStatusTransitionException';
  }
}

export class PaymentAlreadySettledException extends PaymentDomainException {
  constructor(paymentId: string) {
    super(`Le paiement "${paymentId}" a déjà été encaissé ou finalisé.`);
    this.name = 'PaymentAlreadySettledException';
  }
}

export class InvalidPaymentAmountException extends PaymentDomainException {
  constructor(message = 'Le montant du paiement est invalide.') {
    super(message);
    this.name = 'InvalidPaymentAmountException';
  }
}

export class InsufficientLoyaltyPointsException extends PaymentDomainException {
  constructor(available: number, requested: number) {
    super(`Solde de points de fidélité insuffisant (${available} disponibles, ${requested} demandés).`);
    this.name = 'InsufficientLoyaltyPointsException';
  }
}

export class DuplicatePaymentException extends PaymentDomainException {
  constructor(key: string) {
    super(`Un paiement avec la clé d'idempotence "${key}" existe déjà.`);
    this.name = 'DuplicatePaymentException';
  }
}
