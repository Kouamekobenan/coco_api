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
import { CreateStaffDto, UpdateStaffDto } from '../../application/dtos/create-staff.dto.js';
import { StaffResponseDto } from '../../application/dtos/staff-response.dto.js';
import {
  CreateStaffUseCase,
  DeleteStaffUseCase,
  GetSalonStaffUseCase,
  GetStaffByIdUseCase,
  UpdateStaffUseCase,
} from '../../application/usecases/staff.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Staff — Équipe & Coiffeurs')
@Controller({ path: 'salons/:salonId/staff', version: '1' })
export class StaffController {
  constructor(
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly getSalonStaffUseCase: GetSalonStaffUseCase,
    private readonly getStaffByIdUseCase: GetStaffByIdUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly deleteStaffUseCase: DeleteStaffUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter un membre dans l’équipe du salon',
    description: 'Enregistre un coiffeur, tresseuse, barbier ou coloriste dans le salon.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Membre du staff créé avec succès.',
    type: StaffResponseDto,
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.createStaffUseCase.execute(salonId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter l’équipe des coiffeurs du salon',
    description: 'Retourne la liste des coiffeurs / barbiers du salon avec photos et spécialités.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membres du staff trouvés.',
    type: [StaffResponseDto],
  })
  public async findBySalon(
    @Param('salonId') salonId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<StaffResponseDto[]> {
    const filterActive = onlyActive !== 'false';
    return this.getSalonStaffUseCase.execute(salonId, filterActive);
  }

  @Public()
  @Get(':staffId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir la fiche profil d’un coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil du coiffeur.',
    type: StaffResponseDto,
  })
  public async findById(@Param('staffId') staffId: string): Promise<StaffResponseDto> {
    return this.getStaffByIdUseCase.execute(staffId);
  }

  @Patch(':staffId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier les informations d’un coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil mis à jour.',
    type: StaffResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.updateStaffUseCase.execute(salonId, staffId, dto);
  }

  @Delete(':staffId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un membre de l’équipe',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membre retiré du salon avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteStaffUseCase.execute(salonId, staffId);
  }
}
