import { InvalidPasswordException } from '../exceptions/domain.exception.js';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Crée une instance à partir d'un hash existant (chargé depuis la persistance)
   */
  public static fromHash(hash: string): Password {
    if (!hash || hash.trim().length === 0) {
      throw new InvalidPasswordException('Le hash du mot de passe ne peut pas être vide.');
    }
    return new Password(hash);
  }

  /**
   * Valide un mot de passe brut avant hachage
   */
  public static validateRaw(plainText: string): void {
    if (!plainText || typeof plainText !== 'string') {
      throw new InvalidPasswordException('Le mot de passe est obligatoire.');
    }
    if (plainText.length < 6) {
      throw new InvalidPasswordException('Le mot de passe doit contenir au moins 6 caractères.');
    }
  }

  public getHashedValue(): string {
    return this.hashedValue;
  }
}
