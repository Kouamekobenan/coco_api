import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  SalonExperienceConfigResponseDto,
  UpdateSalonExperienceConfigDto,
} from '../../application/dtos/salon-experience-config.dto.js';
import {
  GetSalonExperienceUseCase,
  UpdateSalonExperienceUseCase,
} from '../../application/usecases/salon-experience.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Salons — Expérience & Vitrine')
@Controller({ path: 'salons/:salonId/experience', version: '1' })
export class SalonExperienceController {
  constructor(
    private readonly getSalonExperienceUseCase: GetSalonExperienceUseCase,
    private readonly updateSalonExperienceUseCase: UpdateSalonExperienceUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter la configuration d\'expérience et vitrine du salon',
    description: 'Renvoie le thème, la palette de couleurs, le mode de réservation (RDV, Walk-in, Hybride), et les règles d\'acompte/annulation.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration du salon.',
    type: SalonExperienceConfigResponseDto,
  })
  public async getExperience(
    @Param('salonId') salonId: string,
  ): Promise<SalonExperienceConfigResponseDto> {
    return this.getSalonExperienceUseCase.execute(salonId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour la personnalisation et les règles du salon',
    description: 'Permet au gestionnaire de personnaliser le thème, les couleurs, activer la file d\'attente ou ajuster les seuils d\'annulation.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration mise à jour.',
    type: SalonExperienceConfigResponseDto,
  })
  public async updateExperience(
    @Param('salonId') salonId: string,
    @Body() dto: UpdateSalonExperienceConfigDto,
  ): Promise<SalonExperienceConfigResponseDto> {
    return this.updateSalonExperienceUseCase.execute(salonId, dto);
  }
}
