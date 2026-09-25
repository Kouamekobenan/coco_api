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
  Put,
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
  StaffWorkingHourResponseDto,
  UpdateStaffWorkingHoursDto,
} from '../../application/dtos/staff-working-hours.dto.js';
import {
  CreateStaffBreakDto,
  StaffBreakResponseDto,
} from '../../application/dtos/staff-break.dto.js';
import {
  CreateStaffTimeOffDto,
  StaffTimeOffResponseDto,
  UpdateStaffTimeOffStatusDto,
} from '../../application/dtos/staff-time-off.dto.js';
import {
  CreateStaffBreakUseCase,
  CreateStaffTimeOffUseCase,
  DeleteStaffBreakUseCase,
  DeleteStaffTimeOffUseCase,
  GetStaffScheduleUseCase,
  UpdateStaffTimeOffStatusUseCase,
  UpdateStaffWorkingHoursUseCase,
} from '../../application/usecases/staff-schedule.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';

@ApiTags('Staff — Plannings, Pauses & Congés')
@Controller({ path: 'salons/:salonId/staff/:staffId/schedule', version: '1' })
export class StaffScheduleController {
  constructor(
    private readonly getStaffScheduleUseCase: GetStaffScheduleUseCase,
    private readonly updateStaffWorkingHoursUseCase: UpdateStaffWorkingHoursUseCase,
    private readonly createStaffBreakUseCase: CreateStaffBreakUseCase,
    private readonly deleteStaffBreakUseCase: DeleteStaffBreakUseCase,
    private readonly createStaffTimeOffUseCase: CreateStaffTimeOffUseCase,
    private readonly updateStaffTimeOffStatusUseCase: UpdateStaffTimeOffStatusUseCase,
    private readonly deleteStaffTimeOffUseCase: DeleteStaffTimeOffUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter le planning complet d’un coiffeur',
    description: 'Retourne la grille de travail hebdomadaire, les pauses régulières (déjeuner/prière) et les congés prévus.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Planning complet du coiffeur.',
  })
  public async getSchedule(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
  ) {
    return this.getStaffScheduleUseCase.execute(salonId, staffId);
  }

  @Put('hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configurer les heures de travail hebdomadaires du coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Horaires enregistrés.',
    type: [StaffWorkingHourResponseDto],
  })
  public async updateHours(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffWorkingHoursDto,
  ): Promise<StaffWorkingHourResponseDto[]> {
    return this.updateStaffWorkingHoursUseCase.execute(salonId, staffId, dto);
  }

  @Post('breaks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Programmer une pause (déjeuner, prière, repos)',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pause enregistrée.',
    type: StaffBreakResponseDto,
  })
  public async addBreak(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: CreateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    return this.createStaffBreakUseCase.execute(salonId, staffId, dto);
  }

  @Delete('breaks/:breakId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une pause programmée',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiParam({ name: 'breakId', example: 'break-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pause supprimée.',
  })
  public async deleteBreak(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Param('breakId') breakId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteStaffBreakUseCase.execute(salonId, staffId, breakId);
  }

  @Post('time-off')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer une demande de congé ou absence',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de congé créée.',
    type: StaffTimeOffResponseDto,
  })
  public async addTimeOff(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: CreateStaffTimeOffDto,
  ): Promise<StaffTimeOffResponseDto> {
    return this.createStaffTimeOffUseCase.execute(salonId, staffId, dto);
  }

  @Patch('time-off/:timeOffId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Valider ou refuser un congé (APPROVED / REJECTED)',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiParam({ name: 'timeOffId', example: 'time-off-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut du congé mis à jour.',
  })
  public async updateTimeOffStatus(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Param('timeOffId') timeOffId: string,
    @Body() dto: UpdateStaffTimeOffStatusDto,
  ) {
    return this.updateStaffTimeOffStatusUseCase.execute(salonId, staffId, timeOffId, dto);
  }

  @Delete('time-off/:timeOffId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Annuler une demande de congé',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiParam({ name: 'timeOffId', example: 'time-off-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Congé supprimé.',
  })
  public async deleteTimeOff(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Param('timeOffId') timeOffId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteStaffTimeOffUseCase.execute(salonId, staffId, timeOffId);
  }
}
