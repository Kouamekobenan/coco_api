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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStyleDto, UpdateStyleDto } from '../../application/dtos/create-style.dto.js';
import { StyleQueryDto, StyleResponseDto } from '../../application/dtos/style-query.dto.js';
import {
  CreateStyleUseCase,
  DeleteStyleUseCase,
  GetStyleByIdUseCase,
  GetStyleBySlugUseCase,
  GetStylesUseCase,
  UpdateStyleUseCase,
  UploadStyleImageUseCase,
} from '../../application/usecases/style.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import 'multer';

@ApiTags('Styles — Tendances & Catalogue')
@Controller({ path: 'styles', version: '1' })
export class StylesController {
  constructor(
    private readonly createStyleUseCase: CreateStyleUseCase,
    private readonly getStylesUseCase: GetStylesUseCase,
    private readonly getStyleByIdUseCase: GetStyleByIdUseCase,
    private readonly getStyleBySlugUseCase: GetStyleBySlugUseCase,
    private readonly updateStyleUseCase: UpdateStyleUseCase,
    private readonly uploadStyleImageUseCase: UploadStyleImageUseCase,
    private readonly deleteStyleUseCase: DeleteStyleUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de création d\'un style de coiffure avec image d\'illustration',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Nappy Braids Africaines',
          description: 'Nom du style ou de la coupe de cheveux',
        },
        slug: {
          type: 'string',
          example: 'nappy-braids-africaines',
          description: 'Slug URL (généré automatiquement si absent)',
        },
        universe: {
          type: 'string',
          enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
          default: 'COCOMOUSSO',
          description: 'Univers Coco',
        },
        description: {
          type: 'string',
          example: 'Tresses traditionnelles nappy avec rajouts synthétiques ou naturels.',
          description: 'Description détaillée',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image d\'illustration à téléverser sur Cloudinary',
        },
        imageUrl: {
          type: 'string',
          example: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
          description: 'URL directe de l\'image (optionnelle)',
        },
      },
      required: ['name'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un style de coiffure dans le catalogue global',
    description: 'Enregistre une coupe ou tendance afro / barbier (ex: Nappy Braids, Dégradé américain, Locks) avec son image (Cloudinary).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Style créé avec succès.',
    type: StyleResponseDto,
  })
  public async create(
    @Body() dto: CreateStyleDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<StyleResponseDto> {
    return this.createStyleUseCase.execute(dto, imageFile);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter tous les styles du catalogue',
    description: 'Recherche paginée avec filtres par univers (COCOMOUSSO / COCOTAILLE) et mot-clé.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des styles.',
  })
  public async findAll(@Query() query: StyleQueryDto) {
    return this.getStylesUseCase.execute(query);
  }

  @Public()
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir un style par son slug URL',
  })
  @ApiParam({ name: 'slug', example: 'nappy-braids' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du style.',
    type: StyleResponseDto,
  })
  public async findBySlug(@Param('slug') slug: string): Promise<StyleResponseDto> {
    return this.getStyleBySlugUseCase.execute(slug);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir un style par son identifiant unique',
  })
  @ApiParam({ name: 'id', example: 'style-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du style.',
    type: StyleResponseDto,
  })
  public async findById(@Param('id') id: string): Promise<StyleResponseDto> {
    return this.getStyleByIdUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de modification d\'un style avec nouvelle image d\'illustration',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nappy Braids Pro' },
        universe: { type: 'string', enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] },
        description: { type: 'string', example: 'Nouvelle description...' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Nouveau fichier image d\'illustration (Cloudinary)',
        },
        imageUrl: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier un style du catalogue',
    description: 'Met à jour un style du catalogue avec option de téléverser une nouvelle image sur Cloudinary.',
  })
  @ApiParam({ name: 'id', example: 'style-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Style mis à jour.',
    type: StyleResponseDto,
  })
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateStyleDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<StyleResponseDto> {
    return this.updateStyleUseCase.execute(id, dto, imageFile);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Téléverser l\'image d\'illustration d\'un style vers Cloudinary',
    description: 'Envoie l\'image d\'illustration via multipart/form-data, la stocke sur Cloudinary et met à jour le style.',
  })
  @ApiParam({ name: 'id', example: 'style-uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image du style',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image d\'illustration téléversée et style mis à jour.',
    type: StyleResponseDto,
  })
  public async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StyleResponseDto> {
    return this.uploadStyleImageUseCase.execute(id, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un style du catalogue',
  })
  @ApiParam({ name: 'id', example: 'style-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Style supprimé avec succès.',
  })
  public async delete(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.deleteStyleUseCase.execute(id);
  }
}
