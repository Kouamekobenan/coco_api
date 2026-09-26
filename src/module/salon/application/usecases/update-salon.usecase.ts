import { Inject, Injectable, Optional } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import type { FileUploader } from '../../../../common/cloudinary/file-upload.interface.js';
import { FileUploaderName } from '../../../../common/cloudinary/file-upload.interface.js';
import { UpdateSalonDto } from '../dtos/update-salon.dto.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonCoordinates } from '../../domain/value-objects/salon-coordinates.vo.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';
import 'multer';

export interface SalonUpdateFiles {
  logo?: Express.Multer.File[];
  cover?: Express.Multer.File[];
  coverImage?: Express.Multer.File[];
}

@Injectable()
export class UpdateSalonUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
    @Optional()
    @Inject(FileUploaderName)
    private readonly fileUploader?: FileUploader,
  ) {}

  public async execute(
    id: string,
    dto: UpdateSalonDto,
    files?: SalonUpdateFiles,
  ): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findById(id);
    if (!salon) {
      throw new SalonNotFoundException(id);
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
      coverUrl,
      logoUrl,
    });

    await this.salonRepository.update(salon);

    return SalonDtoMapper.toResponse(salon);
  }
}
