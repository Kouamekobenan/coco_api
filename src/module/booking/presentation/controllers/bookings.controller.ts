import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CreateBookingDto } from '../../application/dtos/create-booking.dto.js';
import { BookingQueryDto } from '../../application/dtos/booking-query.dto.js';
import { AvailabilityQueryDto } from '../../application/dtos/availability-query.dto.js';
import { CancelBookingDto } from '../../application/dtos/cancel-booking.dto.js';
import { UpdateDelayDto } from '../../application/dtos/update-delay.dto.js';
import {
  BookingListResponseDto,
  BookingResponseDto,
} from '../../application/dtos/booking-response.dto.js';
import { AvailableSlotsResponseDto } from '../../application/dtos/available-slots-response.dto.js';
import { BookingDtoMapper } from '../../application/dtos/booking-dto.mapper.js';
import { CreateBookingUseCase } from '../../application/usecases/create-booking.usecase.js';
import { GetAvailableSlotsUseCase } from '../../application/usecases/get-available-slots.usecase.js';
import { GetBookingByIdUseCase } from '../../application/usecases/get-booking-by-id.usecase.js';
import { SearchBookingsUseCase } from '../../application/usecases/search-bookings.usecase.js';
import { BookingLifecycleUseCase } from '../../application/usecases/booking-lifecycle.usecase.js';

@ApiTags('Bookings — Moteur de Réservation & Prestations')
@Controller({ path: 'salons/:salonId/bookings', version: '1' })
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly getBookingByIdUseCase: GetBookingByIdUseCase,
    private readonly searchBookingsUseCase: SearchBookingsUseCase,
    private readonly lifecycleUseCase: BookingLifecycleUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une réservation (Idempotente)',
    description:
      'Crée un rendez-vous avec calcul automatique de la fenêtre prévisionnelle et de sécurité. Bloque le créneau pendant 15 minutes si un acompte est requis.',
  })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.createBookingUseCase.execute(salonId, dto);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Rechercher les créneaux disponibles',
    description:
      'Calcule les créneaux libres de la journée en tenant compte des horaires d\'ouverture, du planning des coiffeurs, des pauses, des congés et des réservations en cours.',
  })
  @ApiResponse({ status: 200, type: AvailableSlotsResponseDto })
  public async getAvailableSlots(
    @Param('salonId') salonId: string,
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    return await this.getAvailableSlotsUseCase.execute(salonId, query);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lister et filtrer les réservations du salon' })
  @ApiResponse({ status: 200, type: BookingListResponseDto })
  public async search(
    @Param('salonId') salonId: string,
    @Query() query: BookingQueryDto,
  ): Promise<BookingListResponseDto> {
    return await this.searchBookingsUseCase.execute(salonId, query);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtenir le détail d\'une réservation et de ses phases' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async getById(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.getBookingByIdUseCase.execute(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/confirm-deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Confirmer le paiement de l\'acompte (verrouille définitivement le créneau)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async confirmDeposit(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.confirmDeposit(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Enregistrer l\'arrivée du client au salon (Check-in)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async checkIn(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.checkIn(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Démarrer la prestation (Passe en cours / IN_PROGRESS)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async start(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.startBooking(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Clôturer la prestation avec succès',
    description:
      'Termine le rendez-vous, horodate la fin effective et met automatiquement à jour la fiche CRM cliente (visites et chiffre d\'affaires).',
  })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async complete(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.completeBooking(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Annuler la réservation avec motif' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async cancel(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.cancelBooking(salonId, bookingId, dto.reason);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Post(':bookingId/no-show')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marquer le rendez-vous comme Non Présenté (No-Show)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async noShow(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.markNoShow(salonId, bookingId);
    return BookingDtoMapper.toResponseDto(booking);
  }

  @Patch(':bookingId/delay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Ajuster la dérive ou le retard en direct',
    description:
      'Décale automatiquement les heures de fin prévisionnelles et de sécurité pour protéger les réservations suivantes.',
  })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  public async updateDelay(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateDelayDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.lifecycleUseCase.updateDelay(
      salonId,
      bookingId,
      dto.delayMinutes,
      dto.isDelayAlertSent,
    );
    return BookingDtoMapper.toResponseDto(booking);
  }
}
