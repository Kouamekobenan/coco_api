import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import {
  CreateSalonPromotionDto,
  SalonPromotionResponseDto,
  UpdateSalonPromotionDto,
} from '../dtos/salon-promotion.dto.js';
import { SalonPromotionEntity } from '../../domain/entities/salon-promotion.entity.js';
import {
  SalonNotFoundException,
  SalonPromotionNotFoundException,
} from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetSalonPromotionsUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, onlyActive = false): Promise<SalonPromotionResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const promotions = await this.salonRepository.findPromotions(salonId, onlyActive);
    return promotions.map((p) => SalonDtoMapper.toPromotionResponse(p));
  }
}

@Injectable()
export class CreateSalonPromotionUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: CreateSalonPromotionDto,
  ): Promise<SalonPromotionResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const promotion = SalonPromotionEntity.create({
      id: randomUUID(),
      salonId,
      title: dto.title,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: dto.isActive,
    });

    await this.salonRepository.savePromotion(promotion);
    return SalonDtoMapper.toPromotionResponse(promotion);
  }
}

@Injectable()
export class UpdateSalonPromotionUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    promotionId: string,
    dto: UpdateSalonPromotionDto,
  ): Promise<SalonPromotionResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const promotion = await this.salonRepository.findPromotionById(promotionId);
    if (!promotion || promotion.getSalonId() !== salonId) {
      throw new SalonPromotionNotFoundException(promotionId);
    }

    promotion.update({
      title: dto.title,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: dto.isActive,
    });

    await this.salonRepository.updatePromotion(promotion);
    return SalonDtoMapper.toPromotionResponse(promotion);
  }
}

@Injectable()
export class DeleteSalonPromotionUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, promotionId: string): Promise<{ success: boolean; message: string }> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const promotion = await this.salonRepository.findPromotionById(promotionId);
    if (!promotion || promotion.getSalonId() !== salonId) {
      throw new SalonPromotionNotFoundException(promotionId);
    }

    await this.salonRepository.deletePromotion(promotionId);
    return {
      success: true,
      message: `Promotion (${promotionId}) supprimée avec succès.`,
    };
  }
}
