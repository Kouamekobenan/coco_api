import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { UpdateSalonStatusDto } from '../dtos/update-salon-status.dto.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class UpdateSalonStatusUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(id: string, dto: UpdateSalonStatusDto): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findById(id);
    if (!salon) {
      throw new SalonNotFoundException(id);
    }

    salon.changeStatus(dto.status);
    await this.salonRepository.update(salon);

    return SalonDtoMapper.toResponse(salon);
  }
}
