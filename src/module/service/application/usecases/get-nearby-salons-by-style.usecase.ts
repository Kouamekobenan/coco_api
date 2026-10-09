import { Inject, Injectable } from '@nestjs/common';
import type { IStyleRepository } from '../../domain/repositories/style.repository.interface.js';
import { STYLE_REPOSITORY } from '../../domain/repositories/style.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { NearbySalonsByStyleQueryDto } from '../dtos/nearby-salons-by-style-query.dto.js';
import { NearbySalonsResponseDto } from '../../../salon/application/dtos/salon-response.dto.js';
import { SalonDtoMapper } from '../../../salon/application/dtos/salon-dto.mapper.js';
import { StyleNotFoundException } from '../../domain/exceptions/service-domain.exception.js';

@Injectable()
export class GetNearbySalonsByStyleUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    styleIdentifier: string,
    query: NearbySalonsByStyleQueryDto,
  ): Promise<NearbySalonsResponseDto[]> {
    // Résolution souple : recherche par ID (UUID), sinon par slug
    let style = await this.styleRepository.findById(styleIdentifier);
    if (!style) {
      style = await this.styleRepository.findBySlug(styleIdentifier);
    }

    if (!style) {
      throw new StyleNotFoundException(styleIdentifier);
    }

    const radius = query.radiusKm ?? 10;
    const limit = query.limit ?? 20;

    const results = await this.salonRepository.findNearby(
      query.latitude,
      query.longitude,
      radius,
      {
        styleId: style.getId(),
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
