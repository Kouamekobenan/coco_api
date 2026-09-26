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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import {
  UploadSalonCoverUseCase,
  UploadSalonLogoUseCase,
} from '../../application/usecases/upload-salon-images.usecase.js';

// Security
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import 'multer';

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
    private readonly uploadSalonLogoUseCase: UploadSalonLogoUseCase,
    private readonly uploadSalonCoverUseCase: UploadSalonCoverUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de création d\'un salon avec images (Cloudinary)',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Salon Ébène Prestige',
          description: 'Nom commercial du salon',
        },
        slug: {
          type: 'string',
          example: 'salon-ebene-prestige',
          description: 'Slug URL personnalisé (optionnel)',
        },
        phone: {
          type: 'string',
          example: '+2250701020304',
          description: 'Téléphone principal (+225)',
        },
        whatsappPhone: {
          type: 'string',
          example: '+2250701020304',
          description: 'Numéro WhatsApp (optionnel)',
        },
        email: {
          type: 'string',
          example: 'contact@ebene-prestige.ci',
          description: 'Adresse email (optionnelle)',
        },
        description: {
          type: 'string',
          example: 'Salon de coiffure afro haut de gamme, spécialisé en nappy hair...',
          description: 'Description de présentation',
        },
        universe: {
          type: 'string',
          enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
          default: 'COCOMOUSSO',
          description: 'Univers Coco',
        },
        commune: {
          type: 'string',
          example: 'Cocody',
          description: 'Commune (ex: Cocody, Yopougon...)',
        },
        quartier: {
          type: 'string',
          example: 'Angré 8ème Tranche',
          description: 'Quartier (ex: Angré, Biétry...)',
        },
        landmark: {
          type: 'string',
          example: 'En face de la pharmacie du 8ème, à 50m du carrefour Mandela',
          description: 'Repère visuel ivoirien',
        },
        latitude: {
          type: 'number',
          example: 5.3599,
          description: 'Latitude GPS',
        },
        longitude: {
          type: 'number',
          example: -4.0083,
          description: 'Longitude GPS',
        },
        address: {
          type: 'string',
          example: 'Boulevard Latrille, Immeuble Horizon, 1er étage',
          description: 'Adresse détaillée (optionnelle)',
        },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image du logo à téléverser sur Cloudinary',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image de couverture à téléverser sur Cloudinary',
        },
      },
      required: ['name', 'phone', 'commune', 'quartier', 'landmark', 'latitude', 'longitude'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau salon',
    description:
      'Enregistre un salon avec ses informations, repères ivoiriens et coordonnées GPS. Formulaire multipart/form-data avec sélecteurs de fichiers d\'images (logo, cover). L\'utilisateur connecté devient automatiquement le propriétaire (SALON_OWNER).',
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
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ): Promise<SalonResponseDto> {
    return this.createSalonUseCase.execute(dto, user.sub, files);
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de modification d\'un salon avec images (Cloudinary)',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Salon Ébène Prestige & Spa',
          description: 'Nouveau nom commercial',
        },
        phone: {
          type: 'string',
          example: '+2250701020304',
          description: 'Nouveau numéro de téléphone',
        },
        whatsappPhone: {
          type: 'string',
          example: '+2250701020304',
          description: 'Nouveau numéro WhatsApp',
        },
        email: {
          type: 'string',
          example: 'contact@ebene-prestige.ci',
          description: 'Nouvelle adresse email',
        },
        description: {
          type: 'string',
          example: 'Description actualisée du salon...',
        },
        universe: {
          type: 'string',
          enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
          description: 'Nouvel univers',
        },
        commune: {
          type: 'string',
          example: 'Cocody',
        },
        quartier: {
          type: 'string',
          example: 'Angré 8ème Tranche',
        },
        landmark: {
          type: 'string',
          example: 'En face de la pharmacie du 8ème, à 50m du carrefour Mandela',
        },
        latitude: {
          type: 'number',
          example: 5.3599,
        },
        longitude: {
          type: 'number',
          example: -4.0083,
        },
        address: {
          type: 'string',
          example: 'Boulevard Latrille, Immeuble Horizon',
        },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Nouveau fichier image du logo (Cloudinary)',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Nouveau fichier image de couverture (Cloudinary)',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour les informations du salon',
    description:
      'Modifie le nom, repères géographiques, contacts, bio et médias de présentation. Formulaire multipart/form-data avec sélecteurs de fichiers d\'images (logo, cover).',
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
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ): Promise<SalonResponseDto> {
    return this.updateSalonUseCase.execute(id, dto, files);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Téléverser le logo du salon vers Cloudinary',
    description: 'Envoie l\'image du logo via multipart/form-data, la stocke sur Cloudinary et met à jour le profil du salon.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image du logo',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logo téléversé et salon mis à jour.',
    type: SalonResponseDto,
  })
  public async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SalonResponseDto> {
    return this.uploadSalonLogoUseCase.execute(id, file);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Téléverser l\'image de couverture du salon vers Cloudinary',
    description: 'Envoie l\'image de couverture via multipart/form-data, la stocke sur Cloudinary et met à jour le profil du salon.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image de couverture',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image de couverture téléversée et salon mis à jour.',
    type: SalonResponseDto,
  })
  public async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SalonResponseDto> {
    return this.uploadSalonCoverUseCase.execute(id, file);
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
