import { InvalidSalonSlugException } from '../exceptions/salon-domain.exception.js';

export class SalonSlug {
  private readonly value: string;

  constructor(rawSlug: string) {
    const sanitized = SalonSlug.slugify(rawSlug);
    if (!SalonSlug.isValid(sanitized)) {
      throw new InvalidSalonSlugException(rawSlug);
    }
    this.value = sanitized;
  }

  public static isValid(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 100;
  }

  public static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
      .replace(/[^a-z0-9\s-]/g, '')     // Enlève caractères spéciaux
      .replace(/[\s_]+/g, '-')          // Espaces/underscores en tirets
      .replace(/-+/g, '-')              // Évite les doubles tirets
      .replace(/^-|-$/g, '');           // Supprime tirets de début/fin
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SalonSlug): boolean {
    return this.value === other.value;
  }
}
