import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscribeSalonUseCase } from './subscribe-salon.usecase.js';
import { UnsubscribeSalonUseCase } from './unsubscribe-salon.usecase.js';
import { GetSubscriptionStatusUseCase } from './get-subscription-status.usecase.js';
import { GetUserSubscriptionsUseCase } from './get-user-subscriptions.usecase.js';
import { GetSalonSubscribersUseCase } from './get-salon-subscribers.usecase.js';
import { UpdateSubscriptionPreferencesUseCase } from './update-subscription-preferences.usecase.js';
import { ISalonSubscriptionRepository } from '../../domain/repositories/salon-subscription.repository.interface.js';
import { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SalonSubscriptionEntity } from '../../domain/entities/salon-subscription.entity.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { SubscriptionNotFoundException } from '../../domain/exceptions/subscription-domain.exception.js';
import { SalonEntity } from '../../../salon/domain/entities/salon.entity.js';
import { SalonSlug } from '../../../salon/domain/value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../../../salon/domain/value-objects/salon-coordinates.vo.js';

describe('Subscription Use Cases', () => {
  let mockSubscriptionRepo: ISalonSubscriptionRepository;
  let mockSalonRepo: ISalonRepository;

  const mockSalon = SalonEntity.reconstitute({
    id: 'salon-1',
    name: 'Salon Ivoire',
    slug: new SalonSlug('salon-ivoire'),
    phone: '+2250102030405',
    whatsappPhone: null,
    email: null,
    description: null,
    universe: 'COCOMOUSSO',
    status: 'ACTIVE',
    commune: 'Cocody',
    quartier: 'Angré',
    landmark: 'Carrefour Duncan',
    coordinates: new SalonCoordinates(5.35, -4.01),
    address: null,
    coverUrl: null,
    logoUrl: null,
    isVerified: true,
    verifiedAt: new Date(),
    averageRating: 4.5,
    reviewCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockSubscriptionRepo = {
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByUserAndSalon: vi.fn(),
      findUserSubscriptions: vi.fn(),
      findSalonSubscribers: vi.fn(),
      countBySalonId: vi.fn(),
      countByUserId: vi.fn(),
    };

    mockSalonRepo = {
      save: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findNearby: vi.fn(),
      existsBySlug: vi.fn(),
    } as unknown as ISalonRepository;
  });

  describe('SubscribeSalonUseCase', () => {
    it('should subscribe user to salon when salon exists and user is not yet subscribed', async () => {
      vi.mocked(mockSalonRepo.findById).mockResolvedValue(mockSalon);
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(null);
      vi.mocked(mockSubscriptionRepo.save).mockImplementation(async (sub) => sub);

      const useCase = new SubscribeSalonUseCase(mockSubscriptionRepo, mockSalonRepo);
      const result = await useCase.execute('user-1', 'salon-1', {
        notifyPromos: true,
        notifyStories: true,
      });

      expect(result.userId).toBe('user-1');
      expect(result.salonId).toBe('salon-1');
      expect(result.notifyPromos).toBe(true);
      expect(mockSubscriptionRepo.save).toHaveBeenCalledOnce();
    });

    it('should throw SalonNotFoundException if salon does not exist', async () => {
      vi.mocked(mockSalonRepo.findById).mockResolvedValue(null);

      const useCase = new SubscribeSalonUseCase(mockSubscriptionRepo, mockSalonRepo);
      await expect(useCase.execute('user-1', 'invalid-salon')).rejects.toThrow(
        SalonNotFoundException,
      );
    });

    it('should update preferences if already subscribed and new preferences provided', async () => {
      const existing = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
        notifyPromos: true,
        notifyStories: true,
      });

      vi.mocked(mockSalonRepo.findById).mockResolvedValue(mockSalon);
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(existing);
      vi.mocked(mockSubscriptionRepo.update).mockImplementation(async (sub) => sub);

      const useCase = new SubscribeSalonUseCase(mockSubscriptionRepo, mockSalonRepo);
      const result = await useCase.execute('user-1', 'salon-1', {
        notifyPromos: false,
        notifyStories: true,
      });

      expect(result.notifyPromos).toBe(false);
      expect(mockSubscriptionRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe('UnsubscribeSalonUseCase', () => {
    it('should unsubscribe user successfully', async () => {
      const existing = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
      });
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(existing);
      vi.mocked(mockSubscriptionRepo.delete).mockResolvedValue(true);

      const useCase = new UnsubscribeSalonUseCase(mockSubscriptionRepo);
      const result = await useCase.execute('user-1', 'salon-1');

      expect(result.success).toBe(true);
      expect(mockSubscriptionRepo.delete).toHaveBeenCalledWith('user-1', 'salon-1');
    });

    it('should throw SubscriptionNotFoundException when not subscribed', async () => {
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(null);

      const useCase = new UnsubscribeSalonUseCase(mockSubscriptionRepo);
      await expect(useCase.execute('user-1', 'salon-1')).rejects.toThrow(
        SubscriptionNotFoundException,
      );
    });
  });

  describe('GetSubscriptionStatusUseCase', () => {
    it('should return subscription status and count', async () => {
      const existing = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
      });
      vi.mocked(mockSalonRepo.findById).mockResolvedValue(mockSalon);
      vi.mocked(mockSubscriptionRepo.countBySalonId).mockResolvedValue(42);
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(existing);

      const useCase = new GetSubscriptionStatusUseCase(mockSubscriptionRepo, mockSalonRepo);
      const result = await useCase.execute('user-1', 'salon-1');

      expect(result.isSubscribed).toBe(true);
      expect(result.subscribersCount).toBe(42);
      expect(result.subscription?.id).toBe('sub-1');
    });

    it('should handle unauthenticated check', async () => {
      vi.mocked(mockSalonRepo.findById).mockResolvedValue(mockSalon);
      vi.mocked(mockSubscriptionRepo.countBySalonId).mockResolvedValue(10);

      const useCase = new GetSubscriptionStatusUseCase(mockSubscriptionRepo, mockSalonRepo);
      const result = await useCase.execute(null, 'salon-1');

      expect(result.isSubscribed).toBe(false);
      expect(result.subscribersCount).toBe(10);
      expect(result.subscription).toBeNull();
    });
  });

  describe('GetUserSubscriptionsUseCase', () => {
    it('should return paginated subscriptions for user', async () => {
      const sub = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
      });
      vi.mocked(mockSubscriptionRepo.findUserSubscriptions).mockResolvedValue({
        items: [sub],
        total: 1,
      });

      const useCase = new GetUserSubscriptionsUseCase(mockSubscriptionRepo);
      const result = await useCase.execute('user-1', { page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('sub-1');
    });
  });

  describe('GetSalonSubscribersUseCase', () => {
    it('should return paginated subscribers for salon', async () => {
      const sub = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
      });
      vi.mocked(mockSalonRepo.findById).mockResolvedValue(mockSalon);
      vi.mocked(mockSubscriptionRepo.findSalonSubscribers).mockResolvedValue({
        items: [sub],
        total: 1,
      });

      const useCase = new GetSalonSubscribersUseCase(mockSubscriptionRepo, mockSalonRepo);
      const result = await useCase.execute('salon-1', { page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('UpdateSubscriptionPreferencesUseCase', () => {
    it('should update preferences successfully', async () => {
      const sub = SalonSubscriptionEntity.create({
        id: 'sub-1',
        userId: 'user-1',
        salonId: 'salon-1',
        notifyPromos: true,
        notifyStories: true,
      });
      vi.mocked(mockSubscriptionRepo.findByUserAndSalon).mockResolvedValue(sub);
      vi.mocked(mockSubscriptionRepo.update).mockImplementation(async (s) => s);

      const useCase = new UpdateSubscriptionPreferencesUseCase(mockSubscriptionRepo);
      const result = await useCase.execute('user-1', 'salon-1', {
        notifyPromos: false,
        notifyStories: false,
      });

      expect(result.notifyPromos).toBe(false);
      expect(result.notifyStories).toBe(false);
    });
  });
});
