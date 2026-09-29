import { SalonSubscriptionEntity } from '../entities/salon-subscription.entity.js';

export const SALON_SUBSCRIPTION_REPOSITORY = Symbol('SALON_SUBSCRIPTION_REPOSITORY');

export interface ISalonSubscriptionRepository {
  save(subscription: SalonSubscriptionEntity): Promise<SalonSubscriptionEntity>;
  update(subscription: SalonSubscriptionEntity): Promise<SalonSubscriptionEntity>;
  delete(userId: string, salonId: string): Promise<boolean>;
  findByUserAndSalon(userId: string, salonId: string): Promise<SalonSubscriptionEntity | null>;
  findUserSubscriptions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SalonSubscriptionEntity[]; total: number }>;
  findSalonSubscribers(
    salonId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SalonSubscriptionEntity[]; total: number }>;
  countBySalonId(salonId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}
