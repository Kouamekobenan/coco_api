import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import {
  CreateBookingPhaseDto,
  UpdateBookingPhaseDto,
} from '../../application/dtos/booking-phase.dto.js';
import { BookingPhaseResponseDto } from '../../application/dtos/booking-response.dto.js';
import { BookingDtoMapper } from '../../application/dtos/booking-dto.mapper.js';
import { BookingPhasesUseCase } from '../../application/usecases/booking-phases.usecase.js';

@ApiTags('Booking Phases — Étapes & Ressources Monopolisées')
@Controller({ path: 'salons/:salonId/bookings/:bookingId/phases', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingPhasesController {
  constructor(private readonly phasesUseCase: BookingPhasesUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une phase à une prestation longue',
    description:
      'Définit une sous-étape (ex: Pose de soin, Shampoing) avec son type (ACTIVE ou PASSIVE) et la ressource monopolisée (Bac, Fauteuil).',
  })
  @ApiResponse({ status: 201, type: BookingPhaseResponseDto })
  public async addPhase(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateBookingPhaseDto,
  ): Promise<BookingPhaseResponseDto> {
    const phase = await this.phasesUseCase.addPhase(salonId, bookingId, dto);
    return BookingDtoMapper.toPhaseResponseDto(phase);
  }

  @Post(':phaseId/start')
  @ApiOperation({ summary: 'Démarrer l\'horodatage d\'une phase' })
  @ApiResponse({ status: 200, type: BookingPhaseResponseDto })
  public async startPhase(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Param('phaseId') phaseId: string,
  ): Promise<BookingPhaseResponseDto> {
    const phase = await this.phasesUseCase.startPhase(salonId, bookingId, phaseId);
    return BookingDtoMapper.toPhaseResponseDto(phase);
  }

  @Post(':phaseId/end')
  @ApiOperation({ summary: 'Clôturer l\'horodatage d\'une phase' })
  @ApiResponse({ status: 200, type: BookingPhaseResponseDto })
  public async endPhase(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Param('phaseId') phaseId: string,
  ): Promise<BookingPhaseResponseDto> {
    const phase = await this.phasesUseCase.endPhase(salonId, bookingId, phaseId);
    return BookingDtoMapper.toPhaseResponseDto(phase);
  }

  @Patch(':phaseId')
  @ApiOperation({ summary: 'Mettre à jour les informations d\'une phase' })
  @ApiResponse({ status: 200, type: BookingPhaseResponseDto })
  public async updatePhase(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Param('phaseId') phaseId: string,
    @Body() dto: UpdateBookingPhaseDto,
  ): Promise<BookingPhaseResponseDto> {
    const phase = await this.phasesUseCase.updatePhase(salonId, bookingId, phaseId, dto);
    return BookingDtoMapper.toPhaseResponseDto(phase);
  }

  @Delete(':phaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une phase de la prestation' })
  @ApiResponse({ status: 204 })
  public async deletePhase(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Param('phaseId') phaseId: string,
  ): Promise<void> {
    await this.phasesUseCase.deletePhase(salonId, bookingId, phaseId);
  }
}
