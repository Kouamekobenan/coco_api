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
import { CreateStyleDto, UpdateStyleDto } from '../../application/dtos/create-style.dto.js';
import { StyleQueryDto, StyleResponseDto } from '../../application/dtos/style-query.dto.js';
import {
  CreateStyleUseCase,
  DeleteStyleUseCase,
  GetStyleByIdUseCase,
  GetStyleBySlugUseCase,
  GetStylesUseCase,
  UpdateStyleUseCase,
} from '../../application/usecases/style.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Styles — Tendances & Catalogue')
@Controller({ path: 'styles', version: '1' })
export class StylesController {
  constructor(
    private readonly createStyleUseCase: CreateStyleUseCase,
    private readonly getStylesUseCase: GetStylesUseCase,
    private readonly getStyleByIdUseCase: GetStyleByIdUseCase,
    private readonly getStyleBySlugUseCase: GetStyleBySlugUseCase,
    private readonly updateStyleUseCase: UpdateStyleUseCase,
    private readonly deleteStyleUseCase: DeleteStyleUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un style de coiffure dans le catalogue global',
    description: 'Enregistre une coupe ou tendance afro / barbier (ex: Nappy Braids, Dégradé américain, Locks).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Style créé avec succès.',
    type: StyleResponseDto,
  })
  public async create(@Body() dto: CreateStyleDto): Promise<StyleResponseDto> {
    return this.createStyleUseCase.execute(dto);
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier un style du catalogue',
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
  ): Promise<StyleResponseDto> {
    return this.updateStyleUseCase.execute(id, dto);
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
