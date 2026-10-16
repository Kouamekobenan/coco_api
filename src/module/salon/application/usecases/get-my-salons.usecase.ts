import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetMySalonsUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(userId: string): Promise<SalonResponseDto[]> {
    const salons = await this.salonRepository.findAllByOwnerUserId(userId);
    return salons.map((salon) => SalonDtoMapper.toResponse(salon));
  }
}
