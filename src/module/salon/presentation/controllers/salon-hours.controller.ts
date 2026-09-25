import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateSalonHourExceptionDto,
  SalonHourExceptionResponseDto,
  SalonHourResponseDto,
  UpdateSalonHoursDto,
} from '../../application/dtos/salon-hours.dto.js';
import {
  AddSalonHourExceptionUseCase,
  DeleteSalonHourExceptionUseCase,
  GetSalonHoursUseCase,
  UpdateSalonHoursUseCase,
} from '../../application/usecases/salon-hours.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Salons — Horaires & Exceptions')
@Controller({ path: 'salons/:salonId/hours', version: '1' })
export class SalonHoursController {
  constructor(
    private readonly getSalonHoursUseCase: GetSalonHoursUseCase,
    private readonly updateSalonHoursUseCase: UpdateSalonHoursUseCase,
    private readonly addSalonHourExceptionUseCase: AddSalonHourExceptionUseCase,
    private readonly deleteSalonHourExceptionUseCase: DeleteSalonHourExceptionUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter les horaires réguliers et exceptions d’un salon',
    description: 'Retourne la grille des horaires d\'ouverture de la semaine ainsi que les fermetures exceptionnelles / jours fériés programmés.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Horaires du salon et exceptions.',
  })
  public async getHours(@Param('salonId') salonId: string) {
    return this.getSalonHoursUseCase.execute(salonId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configurer la grille d’horaires hebdomadaire',
    description: 'Définit les heures d\'ouverture et fermeture pour chaque jour de la semaine (0 = Dimanche à 6 = Samedi).',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Horaires enregistrés.',
    type: [SalonHourResponseDto],
  })
  public async updateHours(
    @Param('salonId') salonId: string,
    @Body() dto: UpdateSalonHoursDto,
  ): Promise<SalonHourResponseDto[]> {
    return this.updateSalonHoursUseCase.execute(salonId, dto);
  }

  @Post('exceptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une fermeture ou horaire exceptionnel',
    description: 'Permet de déclarer une fermeture pour jour férié (Tabaski, Pâques, Noël, Fête Nationale) ou aménagement spécial.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Exception ajoutée.',
    type: SalonHourExceptionResponseDto,
  })
  public async addException(
    @Param('salonId') salonId: string,
    @Body() dto: CreateSalonHourExceptionDto,
  ): Promise<SalonHourExceptionResponseDto> {
    return this.addSalonHourExceptionUseCase.execute(salonId, dto);
  }

  @Delete('exceptions/:exceptionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une exception d’horaire',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'exceptionId', example: 'exc-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exception supprimée avec succès.',
  })
  public async deleteException(
    @Param('salonId') salonId: string,
    @Param('exceptionId') exceptionId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteSalonHourExceptionUseCase.execute(salonId, exceptionId);
  }
}
