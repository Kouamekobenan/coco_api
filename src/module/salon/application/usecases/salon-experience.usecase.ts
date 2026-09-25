import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { SalonExperienceConfigResponseDto, UpdateSalonExperienceConfigDto } from '../dtos/salon-experience-config.dto.js';
import { SalonExperienceConfigEntity } from '../../domain/entities/salon-experience-config.entity.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetSalonExperienceUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string): Promise<SalonExperienceConfigResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    let config = await this.salonRepository.findExperienceConfig(salonId);
    if (!config) {
      // Configuration par défaut créée automatiquement à la volée si absente
      config = SalonExperienceConfigEntity.create({
        id: randomUUID(),
        salonId,
      });
      await this.salonRepository.saveExperienceConfig(config);
    }

    return SalonDtoMapper.toExperienceConfigResponse(config);
  }
}

@Injectable()
export class UpdateSalonExperienceUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: UpdateSalonExperienceConfigDto,
  ): Promise<SalonExperienceConfigResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    let config = await this.salonRepository.findExperienceConfig(salonId);
    if (!config) {
      config = SalonExperienceConfigEntity.create({
        id: randomUUID(),
        salonId,
        theme: dto.theme,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        coverMediaUrl: dto.coverMediaUrl,
        layout: dto.layout,
        bookingMode: dto.bookingMode,
        enableQueue: dto.enableQueue,
        enableDeposit: dto.enableDeposit,
        enableLoyalty: dto.enableLoyalty,
        cancelFreeLimitHours: dto.cancelFreeLimitHours,
        delayAlertThresholdMin: dto.delayAlertThresholdMin,
      });
    } else {
      config.update({
        theme: dto.theme,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        coverMediaUrl: dto.coverMediaUrl,
        layout: dto.layout,
        bookingMode: dto.bookingMode,
        enableQueue: dto.enableQueue,
        enableDeposit: dto.enableDeposit,
        enableLoyalty: dto.enableLoyalty,
        cancelFreeLimitHours: dto.cancelFreeLimitHours,
        delayAlertThresholdMin: dto.delayAlertThresholdMin,
      });
    }

    await this.salonRepository.saveExperienceConfig(config);
    return SalonDtoMapper.toExperienceConfigResponse(config);
  }
}
