import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetNearbySalonsByStyleUseCase } from './get-nearby-salons-by-style.usecase.js';
import type { IStyleRepository } from '../../domain/repositories/style.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { StyleEntity } from '../../domain/entities/style.entity.js';
import { SalonEntity } from '../../../salon/domain/entities/salon.entity.js';
import { SalonSlug } from '../../../salon/domain/value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../../../salon/domain/value-objects/salon-coordinates.vo.js';
import { StyleNotFoundException } from '../../domain/exceptions/service-domain.exception.js';

describe('GetNearbySalonsByStyleUseCase', () => {
  let useCase: GetNearbySalonsByStyleUseCase;
  let mockStyleRepo: IStyleRepository;
  let mockSalonRepo: ISalonRepository;

  const mockStyle = StyleEntity.reconstitute({
    id: 'style-123',
    name: 'Nappy Braids',
    slug: 'nappy-braids',
    universe: 'COCOMOUSSO',
    description: 'Tresses afro naturelles',
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockSalon = SalonEntity.reconstitute({
    id: 'salon-1',
    name: 'Salon Ivoire Prestige',
    slug: new SalonSlug('salon-ivoire-prestige'),
    phone: '+2250701020304',
    whatsappPhone: null,
    email: 'contact@ivoire.ci',
    description: 'Salon premium',
    universe: 'COCOMOUSSO',
    status: 'ACTIVE',
    commune: 'Cocody',
    quartier: 'Angré 8ème Tranche',
    landmark: 'Pharmacie 8ème Tranche',
    coordinates: new SalonCoordinates(5.3599, -4.0083),
    address: 'Boulevard Latrille',
    coverUrl: null,
    logoUrl: null,
    isVerified: true,
    verifiedAt: new Date(),
    averageRating: 4.8,
    reviewCount: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockStyleRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      existsBySlug: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockSalonRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findNearby: vi.fn(),
      existsBySlug: vi.fn(),
      findExperienceConfig: vi.fn(),
      saveExperienceConfig: vi.fn(),
      findHours: vi.fn(),
      saveHours: vi.fn(),
      findHourExceptions: vi.fn(),
      findHourExceptionById: vi.fn(),
      saveHourException: vi.fn(),
      deleteHourException: vi.fn(),
      findMedia: vi.fn(),
      findMediaById: vi.fn(),
      saveMedia: vi.fn(),
      deleteMedia: vi.fn(),
      updateMediaSortOrder: vi.fn(),
      findPromotions: vi.fn(),
      findPromotionById: vi.fn(),
      savePromotion: vi.fn(),
      updatePromotion: vi.fn(),
      deletePromotion: vi.fn(),
    };

    useCase = new GetNearbySalonsByStyleUseCase(mockStyleRepo, mockSalonRepo);
  });

  it('devrait retourner les salons à proximité pour un style existant trouvé par ID', async () => {
    vi.mocked(mockStyleRepo.findById).mockResolvedValue(mockStyle);
    vi.mocked(mockSalonRepo.findNearby).mockResolvedValue([
      { salon: mockSalon, distanceKm: 2.3 },
    ]);

    const result = await useCase.execute('style-123', {
      latitude: 5.35,
      longitude: -4.01,
      radiusKm: 10,
      limit: 20,
    });

    expect(result).toHaveLength(1);
    expect(result[0].salon.id).toBe('salon-1');
    expect(result[0].salon.name).toBe('Salon Ivoire Prestige');
    expect(result[0].distanceKm).toBe(2.3);
    expect(mockSalonRepo.findNearby).toHaveBeenCalledWith(5.35, -4.01, 10, {
      styleId: 'style-123',
      status: 'ACTIVE',
      limit: 20,
    });
  });

  it('devrait retrouver le style par son slug si non trouvé par ID', async () => {
    vi.mocked(mockStyleRepo.findById).mockResolvedValue(null);
    vi.mocked(mockStyleRepo.findBySlug).mockResolvedValue(mockStyle);
    vi.mocked(mockSalonRepo.findNearby).mockResolvedValue([
      { salon: mockSalon, distanceKm: 1.1 },
    ]);

    const result = await useCase.execute('nappy-braids', {
      latitude: 5.35,
      longitude: -4.01,
    });

    expect(result).toHaveLength(1);
    expect(mockStyleRepo.findBySlug).toHaveBeenCalledWith('nappy-braids');
    expect(mockSalonRepo.findNearby).toHaveBeenCalledWith(5.35, -4.01, 10, {
      styleId: 'style-123',
      status: 'ACTIVE',
      limit: 20,
    });
  });

  it('devrait lever StyleNotFoundException si le style n\'existe ni par ID ni par slug', async () => {
    vi.mocked(mockStyleRepo.findById).mockResolvedValue(null);
    vi.mocked(mockStyleRepo.findBySlug).mockResolvedValue(null);

    await expect(
      useCase.execute('style-inexistant', {
        latitude: 5.35,
        longitude: -4.01,
      }),
    ).rejects.toThrow(StyleNotFoundException);

    expect(mockSalonRepo.findNearby).not.toHaveBeenCalled();
  });
});
