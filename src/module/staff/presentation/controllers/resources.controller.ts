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
  CreateResourceDto,
  ResourceResponseDto,
  UpdateResourceDto,
} from '../../application/dtos/resource.dto.js';
import {
  CreateResourceUseCase,
  DeleteResourceUseCase,
  GetResourceByIdUseCase,
  GetSalonResourcesUseCase,
  UpdateResourceUseCase,
} from '../../application/usecases/resource.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Ressources — Postes, Fauteuils & Bacs')
@Controller({ path: 'salons/:salonId/resources', version: '1' })
export class ResourcesController {
  constructor(
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly getSalonResourcesUseCase: GetSalonResourcesUseCase,
    private readonly getResourceByIdUseCase: GetResourceByIdUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un équipement / poste physique dans le salon',
    description: 'Enregistre un fauteuil de coiffure, un bac à shampoing, une cabine VIP ou un outil spécial.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ressource créée avec succès.',
    type: ResourceResponseDto,
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    return this.createResourceUseCase.execute(salonId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les ressources physiques du salon',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'type', required: false, enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'] })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des ressources.',
    type: [ResourceResponseDto],
  })
  public async findAll(
    @Param('salonId') salonId: string,
    @Query('type') type?: 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL',
    @Query('onlyActive') onlyActive?: string,
  ): Promise<ResourceResponseDto[]> {
    const filter = {
      type,
      isActive: onlyActive !== 'false',
    };
    return this.getSalonResourcesUseCase.execute(salonId, filter);
  }

  @Public()
  @Get(':resourceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir les détails d’une ressource',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'resourceId', example: 'resource-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la ressource.',
    type: ResourceResponseDto,
  })
  public async findById(@Param('resourceId') resourceId: string): Promise<ResourceResponseDto> {
    return this.getResourceByIdUseCase.execute(resourceId);
  }

  @Patch(':resourceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier une ressource physique (nom, type, état actif)',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'resourceId', example: 'resource-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ressource mise à jour.',
    type: ResourceResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    return this.updateResourceUseCase.execute(salonId, resourceId, dto);
  }

  @Delete(':resourceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une ressource physique du salon',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'resourceId', example: 'resource-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ressource supprimée avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('resourceId') resourceId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteResourceUseCase.execute(salonId, resourceId);
  }
}
