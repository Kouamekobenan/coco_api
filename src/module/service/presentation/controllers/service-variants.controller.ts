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
  CreateServiceVariantDto,
  UpdateServiceVariantDto,
} from '../../application/dtos/create-service-variant.dto.js';
import { ServiceVariantResponseDto } from '../../application/dtos/service-variant-response.dto.js';
import {
  CreateServiceVariantUseCase,
  DeleteServiceVariantUseCase,
  GetServiceVariantByIdUseCase,
  GetServiceVariantsUseCase,
  UpdateServiceVariantUseCase,
} from '../../application/usecases/service-variant.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Services — Variantes & Tarifs')
@Controller({ path: 'services/:serviceId/variants', version: '1' })
export class ServiceVariantsController {
  constructor(
    private readonly createServiceVariantUseCase: CreateServiceVariantUseCase,
    private readonly getServiceVariantsUseCase: GetServiceVariantsUseCase,
    private readonly getServiceVariantByIdUseCase: GetServiceVariantByIdUseCase,
    private readonly updateServiceVariantUseCase: UpdateServiceVariantUseCase,
    private readonly deleteServiceVariantUseCase: DeleteServiceVariantUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une variante de prestation (longueur, épaisseur, finition)',
    description:
      'Configure les durées (min/estimée/max, setup, marge de repos), le tarif FCFA (fourchette ou fixe), et les règles d\'acompte Mobile Money.',
  })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Variante créée avec succès.',
    type: ServiceVariantResponseDto,
  })
  public async create(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceVariantDto,
  ): Promise<ServiceVariantResponseDto> {
    return this.createServiceVariantUseCase.execute(serviceId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les variantes disponibles pour une prestation',
  })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des variantes.',
    type: [ServiceVariantResponseDto],
  })
  public async findAll(
    @Param('serviceId') serviceId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<ServiceVariantResponseDto[]> {
    const filterActive = onlyActive !== 'false';
    return this.getServiceVariantsUseCase.execute(serviceId, filterActive);
  }

  @Public()
  @Get(':variantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir les détails complets d’une variante',
  })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiParam({ name: 'variantId', example: 'variant-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la variante.',
    type: ServiceVariantResponseDto,
  })
  public async findById(
    @Param('serviceId') serviceId: string,
    @Param('variantId') variantId: string,
  ): Promise<ServiceVariantResponseDto> {
    return this.getServiceVariantByIdUseCase.execute(serviceId, variantId);
  }

  @Patch(':variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier les tarifs, durées ou règles d’une variante',
  })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiParam({ name: 'variantId', example: 'variant-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variante mise à jour.',
    type: ServiceVariantResponseDto,
  })
  public async update(
    @Param('serviceId') serviceId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateServiceVariantDto,
  ): Promise<ServiceVariantResponseDto> {
    return this.updateServiceVariantUseCase.execute(serviceId, variantId, dto);
  }

  @Delete(':variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une variante de prestation',
  })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiParam({ name: 'variantId', example: 'variant-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variante supprimée avec succès.',
  })
  public async delete(
    @Param('serviceId') serviceId: string,
    @Param('variantId') variantId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteServiceVariantUseCase.execute(serviceId, variantId);
  }
}
