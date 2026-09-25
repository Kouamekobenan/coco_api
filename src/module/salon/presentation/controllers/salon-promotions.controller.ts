import {
  Body,
  Controller,
  Delete,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateSalonPromotionDto,
  SalonPromotionResponseDto,
  UpdateSalonPromotionDto,
} from '../../application/dtos/salon-promotion.dto.js';
import {
  CreateSalonPromotionUseCase,
  DeleteSalonPromotionUseCase,
  GetSalonPromotionsUseCase,
  UpdateSalonPromotionUseCase,
} from '../../application/usecases/salon-promotions.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Salons — Promotions & Offres')
@Controller({ path: 'salons/:salonId/promotions', version: '1' })
export class SalonPromotionsController {
  constructor(
    private readonly getSalonPromotionsUseCase: GetSalonPromotionsUseCase,
    private readonly createSalonPromotionUseCase: CreateSalonPromotionUseCase,
    private readonly updateSalonPromotionUseCase: UpdateSalonPromotionUseCase,
    private readonly deleteSalonPromotionUseCase: DeleteSalonPromotionUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter les offres et promotions d’un salon',
    description: 'Retourne la liste des promotions. Par défaut, filtre sur les promotions actuellement actives et valides.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true, description: 'Ne retourner que les promotions actives' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des promotions.',
    type: [SalonPromotionResponseDto],
  })
  public async getPromotions(
    @Param('salonId') salonId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<SalonPromotionResponseDto[]> {
    const filterActive = onlyActive !== 'false';
    return this.getSalonPromotionsUseCase.execute(salonId, filterActive);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une offre promotionnelle',
    description: 'Crée une réduction en pourcentage ou montant fixe en FCFA avec période de validité.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Promotion créée avec succès.',
    type: SalonPromotionResponseDto,
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateSalonPromotionDto,
  ): Promise<SalonPromotionResponseDto> {
    return this.createSalonPromotionUseCase.execute(salonId, dto);
  }

  @Patch(':promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier une offre promotionnelle',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'promotionId', example: 'promo-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promotion modifiée avec succès.',
    type: SalonPromotionResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('promotionId') promotionId: string,
    @Body() dto: UpdateSalonPromotionDto,
  ): Promise<SalonPromotionResponseDto> {
    return this.updateSalonPromotionUseCase.execute(salonId, promotionId, dto);
  }

  @Delete(':promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une offre promotionnelle',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'promotionId', example: 'promo-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promotion supprimée avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('promotionId') promotionId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteSalonPromotionUseCase.execute(salonId, promotionId);
  }
}
