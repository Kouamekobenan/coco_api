import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../domain/repositories/booking.repository.interface.js';
import type { IResourceRepository } from '../../../staff/domain/repositories/resource.repository.interface.js';
import { RESOURCE_REPOSITORY } from '../../../staff/domain/repositories/resource.repository.interface.js';
import { BookingPhaseEntity } from '../../domain/entities/booking-phase.entity.js';
import {
  CreateBookingPhaseDto,
  UpdateBookingPhaseDto,
} from '../dtos/booking-phase.dto.js';
import {
  BookingNotFoundException,
  BookingPhaseNotFoundException,
} from '../../domain/exceptions/booking-domain.exception.js';
import { ResourceNotFoundException } from '../../../staff/domain/exceptions/staff-domain.exception.js';

@Injectable()
export class BookingPhasesUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepo: IResourceRepository,
  ) {}

  public async addPhase(
    salonId: string,
    bookingId: string,
    dto: CreateBookingPhaseDto,
  ): Promise<BookingPhaseEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }

    if (dto.resourceId) {
      const resource = await this.resourceRepo.findById(dto.resourceId);
      if (!resource || resource.getSalonId() !== salonId) {
        throw new ResourceNotFoundException(dto.resourceId);
      }
    }

    const sequenceOrder = dto.sequenceOrder ?? booking.phases.length + 1;

    const phase = new BookingPhaseEntity({
      id: randomUUID(),
      bookingId,
      phaseType: dto.phaseType,
      name: dto.name,
      sequenceOrder,
      durationMinutes: dto.durationMinutes,
      resourceId: dto.resourceId ?? null,
    });

    return await this.bookingRepo.savePhase(phase);
  }

  public async startPhase(
    salonId: string,
    bookingId: string,
    phaseId: string,
  ): Promise<BookingPhaseEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }

    const phase = await this.bookingRepo.findPhaseById(phaseId);
    if (!phase || phase.bookingId !== bookingId) {
      throw new BookingPhaseNotFoundException(phaseId);
    }

    phase.start(new Date());
    return await this.bookingRepo.updatePhase(phase);
  }

  public async endPhase(
    salonId: string,
    bookingId: string,
    phaseId: string,
  ): Promise<BookingPhaseEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }

    const phase = await this.bookingRepo.findPhaseById(phaseId);
    if (!phase || phase.bookingId !== bookingId) {
      throw new BookingPhaseNotFoundException(phaseId);
    }

    phase.end(new Date());
    return await this.bookingRepo.updatePhase(phase);
  }

  public async updatePhase(
    salonId: string,
    bookingId: string,
    phaseId: string,
    dto: UpdateBookingPhaseDto,
  ): Promise<BookingPhaseEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }

    const phase = await this.bookingRepo.findPhaseById(phaseId);
    if (!phase || phase.bookingId !== bookingId) {
      throw new BookingPhaseNotFoundException(phaseId);
    }

    if (dto.resourceId) {
      const resource = await this.resourceRepo.findById(dto.resourceId);
      if (!resource || resource.getSalonId() !== salonId) {
        throw new ResourceNotFoundException(dto.resourceId);
      }
    }

    phase.updateDetails(
      dto.name ?? phase.name,
      dto.durationMinutes ?? phase.durationMinutes,
      dto.phaseType ?? phase.phaseType,
      dto.resourceId !== undefined ? dto.resourceId : phase.resourceId,
    );

    return await this.bookingRepo.updatePhase(phase);
  }

  public async deletePhase(
    salonId: string,
    bookingId: string,
    phaseId: string,
  ): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(bookingId);
    }

    const phase = await this.bookingRepo.findPhaseById(phaseId);
    if (!phase || phase.bookingId !== bookingId) {
      throw new BookingPhaseNotFoundException(phaseId);
    }

    await this.bookingRepo.deletePhase(phaseId);
  }
}
