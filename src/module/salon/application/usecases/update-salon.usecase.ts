import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { UpdateSalonDto } from '../dtos/update-salon.dto.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class UpdateSalonUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(id: string, dto: UpdateSalonDto): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findById(id);
    if (!salon) {
      throw new SalonNotFoundException(id);
    }

    let coordinates: SalonCoordinates | undefined;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      coordinates = new SalonCoordinates(dto.latitude, dto.longitude);
    } else if (dto.latitude !== undefined) {
      coordinates = new SalonCoordinates(dto.latitude, salon.getCoordinates().getLongitude());
    } else if (dto.longitude !== undefined) {
      coordinates = new SalonCoordinates(salon.getCoordinates().getLatitude(), dto.longitude);
    }

    salon.updateProfile({
      name: dto.name,
      phone: dto.phone,
      whatsappPhone: dto.whatsappPhone,
      email: dto.email,
      description: dto.description,
      universe: dto.universe,
      commune: dto.commune,
      quartier: dto.quartier,
      landmark: dto.landmark,
      coordinates,
      address: dto.address,
      coverUrl: dto.coverUrl,
      logoUrl: dto.logoUrl,
    });

    await this.salonRepository.update(salon);

    return SalonDtoMapper.toResponse(salon);
  }
}
