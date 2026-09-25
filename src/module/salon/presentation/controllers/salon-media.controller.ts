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
  CreateSalonMediaDto,
  ReorderSalonMediaDto,
  SalonMediaResponseDto,
} from '../../application/dtos/salon-media.dto.js';
import {
  AddSalonMediaUseCase,
  DeleteSalonMediaUseCase,
  GetSalonMediaUseCase,
  ReorderSalonMediaUseCase,
} from '../../application/usecases/salon-media.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Salons — Médias & Vitrine')
@Controller({ path: 'salons/:salonId/media', version: '1' })
export class SalonMediaController {
  constructor(
    private readonly getSalonMediaUseCase: GetSalonMediaUseCase,
    private readonly addSalonMediaUseCase: AddSalonMediaUseCase,
    private readonly reorderSalonMediaUseCase: ReorderSalonMediaUseCase,
    private readonly deleteSalonMediaUseCase: DeleteSalonMediaUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter la galerie photo/vidéo d’un salon',
    description: 'Retourne tous les visuels vitrine classés par catégorie (SHOWCASE, TEAM, STYLE) et ordre d\'affichage.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des médias vitrine.',
    type: [SalonMediaResponseDto],
  })
  public async getMedia(@Param('salonId') salonId: string): Promise<SalonMediaResponseDto[]> {
    return this.getSalonMediaUseCase.execute(salonId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une photo ou vidéo à la vitrine',
    description: 'Ajoute un élément média (URL Cloudinary/S3) avec sa catégorie.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Média ajouté avec succès.',
    type: SalonMediaResponseDto,
  })
  public async addMedia(
    @Param('salonId') salonId: string,
    @Body() dto: CreateSalonMediaDto,
  ): Promise<SalonMediaResponseDto> {
    return this.addSalonMediaUseCase.execute(salonId, dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réorganiser l’ordre des médias dans la galerie',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ordre mis à jour.',
    type: [SalonMediaResponseDto],
  })
  public async reorder(
    @Param('salonId') salonId: string,
    @Body() dto: ReorderSalonMediaDto,
  ): Promise<SalonMediaResponseDto[]> {
    return this.reorderSalonMediaUseCase.execute(salonId, dto);
  }

  @Delete(':mediaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un média de la vitrine',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'mediaId', example: 'media-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Média supprimé avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteSalonMediaUseCase.execute(salonId, mediaId);
  }
}
