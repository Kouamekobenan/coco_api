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
import { CreateCustomerDto, UpdateCustomerDto } from '../../application/dtos/create-customer.dto.js';
import { CustomerQueryDto } from '../../application/dtos/customer-query.dto.js';
import {
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from '../../application/dtos/customer-response.dto.js';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  GetCustomerByIdUseCase,
  GetSalonCustomersUseCase,
  UpdateCustomerUseCase,
} from '../../application/usecases/customer.usecase.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('CRM — Clients & Fiches Techniques')
@Controller({ path: 'salons/:salonId/customers', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getSalonCustomersUseCase: GetSalonCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer une nouvelle fiche client dans le salon',
    description: 'Crée un profil client rattaché au salon avec son numéro de téléphone (+225) unique.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fiche client créée avec succès.',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un client avec ce numéro de téléphone existe déjà dans ce salon.',
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.createCustomerUseCase.execute(salonId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister et rechercher les clients du salon',
    description: 'Recherche paginée de clients avec filtres par segment (NEW, REGULAR, INACTIVE, VIP) et recherche textuelle par nom ou numéro.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des clients.',
    type: PaginatedCustomersResponseDto,
  })
  public async findAll(
    @Param('salonId') salonId: string,
    @Query() query: CustomerQueryDto,
  ): Promise<PaginatedCustomersResponseDto> {
    return this.getSalonCustomersUseCase.execute(salonId, query);
  }

  @Get(':customerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir la fiche complète d’un client',
    description: 'Détails du client, historique de visites, total dépensé et segmentation.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fiche client.',
    type: CustomerResponseDto,
  })
  public async findById(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
  ): Promise<CustomerResponseDto> {
    return this.getCustomerByIdUseCase.execute(salonId, customerId);
  }

  @Patch(':customerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour les coordonnées ou le segment du client',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fiche client mise à jour.',
    type: CustomerResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.updateCustomerUseCase.execute(salonId, customerId, dto);
  }

  @Delete(':customerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une fiche client du salon',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fiche client supprimée.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteCustomerUseCase.execute(salonId, customerId);
  }
}
