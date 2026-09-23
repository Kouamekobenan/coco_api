import { InvalidPhoneNumberException } from '../exceptions/domain.exception.js';

/**
 * Value Object encapsulant et garantissant l'invariance d'un numéro de téléphone ivoirien.
 * Normalise automatiquement vers le format canonique international E.164 (+225XXXXXXXXXX).
 */
export class PhoneNumber {
  private readonly value: string;

  constructor(rawPhone: string) {
    if (!rawPhone || typeof rawPhone !== 'string') {
      throw new InvalidPhoneNumberException(rawPhone || '');
    }

    const normalized = PhoneNumber.normalize(rawPhone);
    if (!PhoneNumber.isValid(normalized)) {
      throw new InvalidPhoneNumberException(rawPhone);
    }

    this.value = normalized;
  }

  public static create(rawPhone: string): PhoneNumber {
    return new PhoneNumber(rawPhone);
  }

  /**
   * Nettoie et formate le numéro au format international +225XXXXXXXXXX
   */
  public static normalize(rawPhone: string): string {
    // Supprime espaces, tirets, parenthèses et points
    let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

    // Si le numéro commence par +225
    if (cleaned.startsWith('+225')) {
      return cleaned;
    }

    // Si le numéro commence par 00225
    if (cleaned.startsWith('00225')) {
      return '+' + cleaned.substring(2);
    }

    // Si le numéro commence par 225 sans le +
    if (cleaned.startsWith('225') && cleaned.length === 13) {
      return '+' + cleaned;
    }

    // Si le numéro est au format local 10 chiffres (ex: 07XXXXXXXX, 05XXXXXXXX, 01XXXXXXXX)
    if (cleaned.length === 10) {
      return `+225${cleaned}`;
    }

    // Si le numéro est au format ancien 8 chiffres (fallback compatibilité en ajoutant 07/05/01 si préfixé)
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * Vérifie la conformité avec la numérotation officielle de Côte d'Ivoire (10 chiffres après +225)
   */
  public static isValid(phone: string): boolean {
    // Format E.164 CI : +225 suivi de 10 chiffres débutant généralement par 01, 05 ou 07 pour les mobiles
    const ciPhoneRegex = /^\+225[0-9]{10}$/;
    return ciPhoneRegex.test(phone);
  }

  public getValue(): string {
    return this.value;
  }

  public getNationalFormat(): string {
    // Format local lisible : 07 12 34 56 78
    const digits = this.value.replace('+225', '');
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }

  public equals(other: PhoneNumber): boolean {
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
