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
import { CreateServiceDto, UpdateServiceDto } from '../../application/dtos/create-service.dto.js';
import { ReorderServicesDto } from '../../application/dtos/reorder-services.dto.js';
import { ServiceResponseDto } from '../../application/dtos/service-response.dto.js';
import {
  CreateServiceUseCase,
  DeleteServiceUseCase,
  GetSalonServicesUseCase,
  GetServiceByIdUseCase,
  ReorderServicesUseCase,
  UpdateServiceUseCase,
} from '../../application/usecases/service.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Services — Prestations Salon')
@Controller({ path: 'salons/:salonId/services', version: '1' })
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getSalonServicesUseCase: GetSalonServicesUseCase,
    private readonly getServiceByIdUseCase: GetServiceByIdUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly reorderServicesUseCase: ReorderServicesUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une prestation à la carte du salon',
    description: 'Crée un service (ex: Tresses sénégalaises, Dégradé) rattaché optionnellement à un style de catalogue.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Prestation créée avec succès.',
    type: ServiceResponseDto,
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.createServiceUseCase.execute(salonId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter le menu complet des prestations du salon',
    description: 'Renvoie toutes les prestations actives du salon avec leurs variantes de prix, durées et conditions.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carte des prestations du salon.',
    type: [ServiceResponseDto],
  })
  public async findBySalon(
    @Param('salonId') salonId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<ServiceResponseDto[]> {
    const filterActive = onlyActive !== 'false';
    return this.getSalonServicesUseCase.execute(salonId, filterActive);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réorganiser l’ordre des prestations sur la carte',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ordre mis à jour.',
    type: [ServiceResponseDto],
  })
  public async reorder(
    @Param('salonId') salonId: string,
    @Body() dto: ReorderServicesDto,
  ): Promise<ServiceResponseDto[]> {
    return this.reorderServicesUseCase.execute(salonId, dto);
  }

  @Public()
  @Get(':serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir les détails d’une prestation spécifique',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la prestation.',
    type: ServiceResponseDto,
  })
  public async findById(@Param('serviceId') serviceId: string): Promise<ServiceResponseDto> {
    return this.getServiceByIdUseCase.execute(serviceId);
  }

  @Patch(':serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier les informations d’une prestation',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prestation mise à jour.',
    type: ServiceResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.updateServiceUseCase.execute(salonId, serviceId, dto);
  }

  @Delete(':serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une prestation du salon',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'serviceId', example: 'service-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prestation supprimée avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteServiceUseCase.execute(salonId, serviceId);
  }
}
