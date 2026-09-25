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
  AssignStaffServiceDto,
  StaffServiceResponseDto,
  UpdateStaffServiceDto,
} from '../../application/dtos/staff-service.dto.js';
import {
  AssignStaffServiceUseCase,
  DeleteStaffServiceUseCase,
  GetStaffServicesUseCase,
  UpdateStaffServiceUseCase,
} from '../../application/usecases/staff-services.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Staff — Compétences & Prestations')
@Controller({ path: 'salons/:salonId/staff/:staffId/services', version: '1' })
export class StaffServicesController {
  constructor(
    private readonly assignStaffServiceUseCase: AssignStaffServiceUseCase,
    private readonly getStaffServicesUseCase: GetStaffServicesUseCase,
    private readonly updateStaffServiceUseCase: UpdateStaffServiceUseCase,
    private readonly deleteStaffServiceUseCase: DeleteStaffServiceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Attribuer une prestation à un coiffeur (avec durées sur-mesure)',
    description: 'Permet d\'associer un service au coiffeur et de spécifier sa vitesse d\'exécution propre (durée min/estimée/max).',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compétence attribuée.',
    type: StaffServiceResponseDto,
  })
  public async assign(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: AssignStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
    return this.assignStaffServiceUseCase.execute(salonId, staffId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter les prestations maîtrisées par le coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des prestations attribuées au coiffeur.',
    type: [StaffServiceResponseDto],
  })
  public async findServices(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
  ): Promise<StaffServiceResponseDto[]> {
    return this.getStaffServicesUseCase.execute(salonId, staffId);
  }

  @Patch(':staffServiceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajuster les durées de réalisation personnalisées du coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiParam({ name: 'staffServiceId', example: 'staff-service-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compétence mise à jour.',
    type: StaffServiceResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Param('staffServiceId') staffServiceId: string,
    @Body() dto: UpdateStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
    return this.updateStaffServiceUseCase.execute(salonId, staffId, staffServiceId, dto);
  }

  @Delete(':staffServiceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retirer une prestation du catalogue du coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiParam({ name: 'staffServiceId', example: 'staff-service-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compétence retirée.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Param('staffServiceId') staffServiceId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteStaffServiceUseCase.execute(salonId, staffId, staffServiceId);
  }
}
