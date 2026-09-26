import { Inject, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import type { FileUploader } from '../../../../common/cloudinary/file-upload.interface.js';
import { FileUploaderName } from '../../../../common/cloudinary/file-upload.interface.js';
import { CreateSalonDto } from '../dtos/create-salon.dto.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonEntity } from '../../domain/entities/salon.entity.js';
import { SalonSlug } from '../../domain/value-objects/salon-slug.vo.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonSlugAlreadyExistsException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';
import 'multer';

export interface SalonCreateFiles {
  logo?: Express.Multer.File[];
  cover?: Express.Multer.File[];
  coverImage?: Express.Multer.File[];
}

@Injectable()
export class CreateSalonUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
    @Optional()
    @Inject(FileUploaderName)
    private readonly fileUploader?: FileUploader,
  ) {}

  public async execute(
    dto: CreateSalonDto,
    ownerUserId?: string,
    files?: SalonCreateFiles,
  ): Promise<SalonResponseDto> {
    const rawSlug = dto.slug && dto.slug.trim().length > 0 ? dto.slug : dto.name;
    const salonSlug = new SalonSlug(rawSlug);

    const slugExists = await this.salonRepository.existsBySlug(salonSlug.getValue());
    if (slugExists) {
      throw new SalonSlugAlreadyExistsException(salonSlug.getValue());
    }

    let logoUrl = dto.logoUrl;
    let coverUrl = dto.coverUrl;

    if (this.fileUploader && files) {
      const logoFile = files.logo?.[0];
      const coverFile = files.cover?.[0] || files.coverImage?.[0];

      if (logoFile) {
        logoUrl = await this.fileUploader.upload(logoFile, 'image');
      }
      if (coverFile) {
        coverUrl = await this.fileUploader.upload(coverFile, 'image');
      }
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
      coverUrl,
      logoUrl,
    });

    await this.salonRepository.save(salon, ownerUserId);

    return SalonDtoMapper.toResponse(salon);
  }
}
