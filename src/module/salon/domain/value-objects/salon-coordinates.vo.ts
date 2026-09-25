import { InvalidCoordinatesException } from '../exceptions/salon-domain.exception.js';

export class SalonCoordinates {
  private readonly latitude: number;
  private readonly longitude: number;

  constructor(latitude: number, longitude: number) {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new InvalidCoordinatesException(latitude, longitude);
    }

    this.latitude = latitude;
    this.longitude = longitude;
  }

  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }

  /**
   * Calcul de la distance en kilomètres (formule de Haversine)
   */
  public distanceTo(other: SalonCoordinates): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(other.latitude - this.latitude);
    const dLon = this.deg2rad(other.longitude - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(this.latitude)) *
        Math.cos(this.deg2rad(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
