import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { SalonQueryDto } from '../dtos/salon-query.dto.js';
import { PaginatedSalonsResponseDto } from '../dtos/paginated-salons-response.dto.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class SearchSalonsUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(query: SalonQueryDto): Promise<PaginatedSalonsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { salons, total } = await this.salonRepository.findAll({
      page,
      limit,
      search: query.search,
      universe: query.universe,
      commune: query.commune,
      quartier: query.quartier,
      status: query.status,
      isVerified: query.isVerified,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: salons.map((salon) => SalonDtoMapper.toResponse(salon)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
