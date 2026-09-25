import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import {
  CreateSalonMediaDto,
  ReorderSalonMediaDto,
  SalonMediaResponseDto,
} from '../dtos/salon-media.dto.js';
import { SalonMediaEntity } from '../../domain/entities/salon-media.entity.js';
import {
  SalonMediaNotFoundException,
  SalonNotFoundException,
} from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetSalonMediaUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string): Promise<SalonMediaResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const mediaList = await this.salonRepository.findMedia(salonId);
    return mediaList.map((m) => SalonDtoMapper.toMediaResponse(m));
  }
}

@Injectable()
export class AddSalonMediaUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: CreateSalonMediaDto): Promise<SalonMediaResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const mediaEntity = SalonMediaEntity.create({
      id: randomUUID(),
      salonId,
      url: dto.url,
      mediaType: dto.mediaType,
      category: dto.category,
      sortOrder: dto.sortOrder,
    });

    await this.salonRepository.saveMedia(mediaEntity);
    return SalonDtoMapper.toMediaResponse(mediaEntity);
  }
}

@Injectable()
export class ReorderSalonMediaUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: ReorderSalonMediaDto,
  ): Promise<SalonMediaResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    await this.salonRepository.updateMediaSortOrder(salonId, dto.orders);

    const updatedMedia = await this.salonRepository.findMedia(salonId);
    return updatedMedia.map((m) => SalonDtoMapper.toMediaResponse(m));
  }
}

@Injectable()
export class DeleteSalonMediaUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, mediaId: string): Promise<{ success: boolean; message: string }> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const media = await this.salonRepository.findMediaById(mediaId);
    if (!media) {
      throw new SalonMediaNotFoundException(mediaId);
    }

    await this.salonRepository.deleteMedia(mediaId);
    return {
      success: true,
      message: `Média (${mediaId}) supprimé avec succès de la vitrine.`,
    };
  }
}
