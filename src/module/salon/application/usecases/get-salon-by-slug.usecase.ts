import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetSalonBySlugUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(slug: string): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findBySlug(slug);
    if (!salon) {
      throw new SalonNotFoundException(slug);
    }
    return SalonDtoMapper.toResponse(salon);
  }
}
