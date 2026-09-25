import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { CreateSalonDto } from '../dtos/create-salon.dto.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonEntity } from '../../domain/entities/salon.entity.js';
import { SalonSlug } from '../../domain/value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonSlugAlreadyExistsException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class CreateSalonUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(dto: CreateSalonDto, ownerUserId?: string): Promise<SalonResponseDto> {
    const rawSlug = dto.slug && dto.slug.trim().length > 0 ? dto.slug : dto.name;
    const salonSlug = new SalonSlug(rawSlug);

    const slugExists = await this.salonRepository.existsBySlug(salonSlug.getValue());
    if (slugExists) {
      throw new SalonSlugAlreadyExistsException(salonSlug.getValue());
    }

    const coordinates = new SalonCoordinates(dto.latitude, dto.longitude);
    const id = randomUUID();

    const salon = SalonEntity.create({
      id,
      name: dto.name,
      slug: salonSlug,
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

    await this.salonRepository.save(salon, ownerUserId);

    return SalonDtoMapper.toResponse(salon);
  }
}
