import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { NearbySalonsQueryDto } from '../dtos/nearby-salons-query.dto.js';
import { NearbySalonsResponseDto } from '../dtos/salon-response.dto.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class FindNearbySalonsUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(query: NearbySalonsQueryDto): Promise<NearbySalonsResponseDto[]> {
    const radius = query.radiusKm ?? 10;
    const limit = query.limit ?? 20;

    const results = await this.salonRepository.findNearby(
      query.latitude,
      query.longitude,
      radius,
      {
        universe: query.universe,
        status: 'ACTIVE',
        limit,
      },
    );

    return results.map((item) => ({
      salon: SalonDtoMapper.toResponse(item.salon),
      distanceKm: item.distanceKm,
    }));
  }
}
