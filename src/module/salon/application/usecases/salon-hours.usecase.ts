import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import {
  CreateSalonHourExceptionDto,
  SalonHourExceptionResponseDto,
  SalonHourResponseDto,
  UpdateSalonHoursDto,
} from '../dtos/salon-hours.dto.js';
import { SalonHourEntity } from '../../domain/entities/salon-hour.entity.js';
import { SalonHourExceptionEntity } from '../../domain/entities/salon-hour-exception.entity.js';
import {
  SalonHourExceptionNotFoundException,
  SalonNotFoundException,
} from '../../domain/exceptions/salon-domain.exception.js';
import { SalonDtoMapper } from '../dtos/salon-dto.mapper.js';

@Injectable()
export class GetSalonHoursUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string): Promise<{
    hours: SalonHourResponseDto[];
    exceptions: SalonHourExceptionResponseDto[];
  }> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const [hours, exceptions] = await Promise.all([
      this.salonRepository.findHours(salonId),
      this.salonRepository.findHourExceptions(salonId),
    ]);

    return {
      hours: hours.map((h) => SalonDtoMapper.toHourResponse(h)),
      exceptions: exceptions.map((e) => SalonDtoMapper.toHourExceptionResponse(e)),
    };
  }
}

@Injectable()
export class UpdateSalonHoursUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: UpdateSalonHoursDto,
  ): Promise<SalonHourResponseDto[]> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const entities = dto.hours.map((item) =>
      SalonHourEntity.create({
        id: randomUUID(),
        salonId,
        dayOfWeek: item.dayOfWeek,
        openTime: item.openTime,
        closeTime: item.closeTime,
        isClosed: item.isClosed,
      }),
    );

    await this.salonRepository.saveHours(salonId, entities);

    const savedHours = await this.salonRepository.findHours(salonId);
    return savedHours.map((h) => SalonDtoMapper.toHourResponse(h));
  }
}

@Injectable()
export class AddSalonHourExceptionUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    dto: CreateSalonHourExceptionDto,
  ): Promise<SalonHourExceptionResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const exceptionDate = new Date(dto.date);
    const entity = SalonHourExceptionEntity.create({
      id: randomUUID(),
      salonId,
      date: exceptionDate,
      openTime: dto.openTime,
      closeTime: dto.closeTime,
      isClosed: dto.isClosed,
      reason: dto.reason,
    });

    await this.salonRepository.saveHourException(entity);
    return SalonDtoMapper.toHourExceptionResponse(entity);
  }
}

@Injectable()
export class DeleteSalonHourExceptionUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, exceptionId: string): Promise<{ success: boolean; message: string }> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const exception = await this.salonRepository.findHourExceptionById(exceptionId);
    if (!exception) {
      throw new SalonHourExceptionNotFoundException(exceptionId);
    }

    await this.salonRepository.deleteHourException(exceptionId);
    return {
      success: true,
      message: `Exception d'horaire (${exceptionId}) supprimée avec succès.`,
    };
  }
}
