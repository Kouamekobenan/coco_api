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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSalonDto } from '../../application/dtos/create-salon.dto.js';
import { UpdateSalonDto } from '../../application/dtos/update-salon.dto.js';
import { UpdateSalonStatusDto } from '../../application/dtos/update-salon-status.dto.js';
import { SalonQueryDto } from '../../application/dtos/salon-query.dto.js';
import { NearbySalonsQueryDto } from '../../application/dtos/nearby-salons-query.dto.js';
import { NearbySalonsResponseDto, SalonResponseDto } from '../../application/dtos/salon-response.dto.js';
import { PaginatedSalonsResponseDto } from '../../application/dtos/paginated-salons-response.dto.js';

// Use Cases
import { CreateSalonUseCase } from '../../application/usecases/create-salon.usecase.js';
import { GetSalonByIdUseCase } from '../../application/usecases/get-salon-by-id.usecase.js';
import { GetSalonBySlugUseCase } from '../../application/usecases/get-salon-by-slug.usecase.js';
import { SearchSalonsUseCase } from '../../application/usecases/search-salons.usecase.js';
import { FindNearbySalonsUseCase } from '../../application/usecases/find-nearby-salons.usecase.js';
import { UpdateSalonUseCase } from '../../application/usecases/update-salon.usecase.js';
import { UpdateSalonStatusUseCase } from '../../application/usecases/update-salon-status.usecase.js';
import { VerifySalonUseCase } from '../../application/usecases/verify-salon.usecase.js';
import { DeleteSalonUseCase } from '../../application/usecases/delete-salon.usecase.js';

// Security
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';

@ApiTags('Salons')
@Controller({ path: 'salons', version: '1' })
export class SalonsController {
  constructor(
    private readonly createSalonUseCase: CreateSalonUseCase,
    private readonly getSalonByIdUseCase: GetSalonByIdUseCase,
    private readonly getSalonBySlugUseCase: GetSalonBySlugUseCase,
    private readonly searchSalonsUseCase: SearchSalonsUseCase,
    private readonly findNearbySalonsUseCase: FindNearbySalonsUseCase,
    private readonly updateSalonUseCase: UpdateSalonUseCase,
    private readonly updateSalonStatusUseCase: UpdateSalonStatusUseCase,
    private readonly verifySalonUseCase: VerifySalonUseCase,
    private readonly deleteSalonUseCase: DeleteSalonUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau salon',
    description:
      'Enregistre un salon avec ses informations, repères ivoiriens et coordonnées GPS. L\'utilisateur connecté devient automatiquement le propriétaire (SALON_OWNER).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Salon créé avec succès.',
    type: SalonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un salon avec ce nom ou ce slug existe déjà.',
  })
  public async create(
    @Body() dto: CreateSalonDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<SalonResponseDto> {
    return this.createSalonUseCase.execute(dto, user.sub);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechercher et lister les salons',
    description:
      'Recherche paginée de salons avec filtres avancés : univers (COCOMOUSSO / COCOTAILLE), commune (Cocody, Yopougon...), quartier, statut et recherche textuelle.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des salons.',
    type: PaginatedSalonsResponseDto,
  })
  public async findAll(@Query() query: SalonQueryDto): Promise<PaginatedSalonsResponseDto> {
    return this.searchSalonsUseCase.execute(query);
  }

  @Public()
  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trouver les salons à proximité géographique (GPS)',
    description:
      'Retourne les salons actifs dans un rayon donné (ex: 10 km) autour des coordonnées GPS de l\'utilisateur, triés par distance croissante.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salons à proximité avec distance en kilomètres.',
    type: [NearbySalonsResponseDto],
  })
  public async findNearby(@Query() query: NearbySalonsQueryDto): Promise<NearbySalonsResponseDto[]> {
    return this.findNearbySalonsUseCase.execute(query);
  }

  @Public()
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir la vitrine publique d’un salon par son slug',
    description:
      'Permet d\'afficher la vitrine publique du salon avec horaires, médias, promotions actives et avis.',
  })
  @ApiParam({ name: 'slug', example: 'salon-ebene-prestige' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du salon et vitrine.',
    type: SalonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Salon introuvable avec ce slug.',
  })
  public async findBySlug(@Param('slug') slug: string): Promise<SalonResponseDto> {
    return this.getSalonBySlugUseCase.execute(slug);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir les détails d’un salon par son identifiant unique',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails complets du salon.',
    type: SalonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Salon introuvable.',
  })
  public async findById(@Param('id') id: string): Promise<SalonResponseDto> {
    return this.getSalonByIdUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour les informations du salon',
    description: 'Modifie le nom, repères géographiques, contacts, bio et médias de présentation.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salon mis à jour avec succès.',
    type: SalonResponseDto,
  })
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateSalonDto,
  ): Promise<SalonResponseDto> {
    return this.updateSalonUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Changer le statut du salon',
    description:
      'Applique une transition d\'état (DRAFT -> PENDING_REVIEW -> ACTIVE -> SUSPENDED -> ARCHIVED) selon les règles de la machine à états.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut du salon mis à jour.',
    type: SalonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transition de statut interdite.',
  })
  public async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSalonStatusDto,
  ): Promise<SalonResponseDto> {
    return this.updateSalonStatusUseCase.execute(id, dto);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Certifier ou retirer la certification d’un salon',
    description: 'Attribue le badge officiel de vérification Coco à un salon audité.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certification mise à jour.',
    type: SalonResponseDto,
  })
  public async verify(
    @Param('id') id: string,
    @Query('verified') verified?: string,
  ): Promise<SalonResponseDto> {
    const isVerified = verified !== 'false';
    return this.verifySalonUseCase.execute(id, isVerified);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer définitivement un salon',
    description: 'Supprime un salon et cascade sur ses configurations, horaires et médias.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salon supprimé avec succès.',
  })
  public async delete(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.deleteSalonUseCase.execute(id);
  }
}
