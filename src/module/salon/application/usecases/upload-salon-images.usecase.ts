import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import type { FileUploader } from '../../../../common/cloudinary/file-upload.interface.js';
import { FileUploaderName } from '../../../../common/cloudinary/file-upload.interface.js';
import { SalonResponseDto } from '../dtos/salon-response.dto.js';
import { SalonMediaResponseDto } from '../dtos/salon-media.dto.js';
import { SalonMediaEntity } from '../../domain/entities/salon-media.entity.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';
import 'multer';

@Injectable()
export class UploadSalonLogoUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}

  public async execute(salonId: string, file: Express.Multer.File): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const logoUrl = await this.fileUploader.upload(file, 'image');
    salon.updateProfile({ logoUrl });

    await this.salonRepository.update(salon);
    return SalonDtoMapper.toResponse(salon);
  }
}

@Injectable()
export class UploadSalonCoverUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}

  public async execute(salonId: string, file: Express.Multer.File): Promise<SalonResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const coverUrl = await this.fileUploader.upload(file, 'image');
    salon.updateProfile({ coverUrl });

    await this.salonRepository.update(salon);
    return SalonDtoMapper.toResponse(salon);
  }
}

@Injectable()
export class UploadSalonMediaFileUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}

  public async execute(
    salonId: string,
    file: Express.Multer.File,
    category: 'SHOWCASE' | 'TEAM' | 'STYLE' = 'SHOWCASE',
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE',
  ): Promise<SalonMediaResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const type = mediaType.toLowerCase() as 'image' | 'video';
    const mediaUrl = await this.fileUploader.upload(file, type);

    const mediaEntity = SalonMediaEntity.create({
      id: randomUUID(),
      salonId,
      url: mediaUrl,
      mediaType,
      category,
      sortOrder: 0,
    });

    await this.salonRepository.saveMedia(mediaEntity);
    return SalonDtoMapper.toMediaResponse(mediaEntity);
  }
}
