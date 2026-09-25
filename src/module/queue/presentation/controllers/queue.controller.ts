import {
  Body,
  Controller,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CreateWalkInTicketDto } from '../../application/dtos/create-walkin-ticket.dto.js';
import { CreateAppointmentTicketDto } from '../../application/dtos/create-appointment-ticket.dto.js';
import { QueueQueryDto } from '../../application/dtos/queue-query.dto.js';
import { CallTicketDto } from '../../application/dtos/call-ticket.dto.js';
import { UpdateWaitEstimateDto } from '../../application/dtos/update-wait-estimate.dto.js';
import {
  QueueTicketListResponseDto,
  QueueTicketResponseDto,
} from '../../application/dtos/queue-ticket-response.dto.js';
import { LiveQueueDashboardResponseDto } from '../../application/dtos/live-queue-dashboard-response.dto.js';
import { QueueDtoMapper } from '../../application/dtos/queue-dto.mapper.js';
import { CreateTicketUseCase } from '../../application/usecases/create-ticket.usecase.js';
import { GetTicketUseCase } from '../../application/usecases/get-ticket.usecase.js';
import { GetLiveQueueDashboardUseCase } from '../../application/usecases/get-live-queue-dashboard.usecase.js';
import { QueueLifecycleUseCase } from '../../application/usecases/queue-lifecycle.usecase.js';
import { SearchQueueTicketsUseCase } from '../../application/usecases/search-queue-tickets.usecase.js';
import { UpdateWaitEstimateUseCase } from '../../application/usecases/update-wait-estimate.usecase.js';

@ApiTags('Queue — File d\'Attente Hybride & Live Tracking')
@Controller({ path: 'salons/:salonId/queue', version: '1' })
export class QueueController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getTicketUseCase: GetTicketUseCase,
    private readonly dashboardUseCase: GetLiveQueueDashboardUseCase,
    private readonly lifecycleUseCase: QueueLifecycleUseCase,
    private readonly searchTicketsUseCase: SearchQueueTicketsUseCase,
    private readonly updateEstimateUseCase: UpdateWaitEstimateUseCase,
  ) {}

  @Post('walk-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un ticket sans rendez-vous (Walk-in)',
    description:
      'Génère un numéro séquentiel (ex: W-001) et calcule automatiquement l\'estimation d\'attente selon le nombre de clients présents.',
  })
  @ApiResponse({ status: 201, type: QueueTicketResponseDto })
  public async createWalkIn(
    @Param('salonId') salonId: string,
    @Body() dto: CreateWalkInTicketDto,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.createTicketUseCase.createWalkInTicket(salonId, dto);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Post('appointment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enregistrer l\'arrivée d\'un client avec rendez-vous (Check-in RDV)',
    description:
      'Génère un numéro prioritaire (ex: A-001) et met à jour le statut du rendez-vous en CHECKED_IN.',
  })
  @ApiResponse({ status: 201, type: QueueTicketResponseDto })
  public async createAppointment(
    @Param('salonId') salonId: string,
    @Body() dto: CreateAppointmentTicketDto,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.createTicketUseCase.createAppointmentTicket(salonId, dto);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Get('live')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tableau de bord live de la file d\'attente',
    description:
      'Fournit la vision en temps réel du salon : tickets appelés, en prestation, file d\'attente et estimation moyenne pour les écrans ou tablettes.',
  })
  @ApiResponse({ status: 200, type: LiveQueueDashboardResponseDto })
  public async getLiveDashboard(
    @Param('salonId') salonId: string,
  ): Promise<LiveQueueDashboardResponseDto> {
    return await this.dashboardUseCase.execute(salonId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister et rechercher dans l\'historique des tickets' })
  @ApiResponse({ status: 200, type: QueueTicketListResponseDto })
  public async search(
    @Param('salonId') salonId: string,
    @Query() query: QueueQueryDto,
  ): Promise<QueueTicketListResponseDto> {
    return await this.searchTicketsUseCase.execute(salonId, query);
  }

  @Post('call-next')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Appeler le prochain client (Algorithme d\'ordonnancement hybride)',
    description:
      'Sélectionne automatiquement le prochain ticket : donne la priorité aux RDV confirmés à l\'heure, puis aux walk-ins selon l\'ordre d\'arrivée.',
  })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async callNext(
    @Param('salonId') salonId: string,
    @Body() dto: CallTicketDto,
  ): Promise<QueueTicketResponseDto | null> {
    const ticket = await this.lifecycleUseCase.callNext(salonId, dto.graceMinutes);
    return ticket ? QueueDtoMapper.toResponseDto(ticket) : null;
  }

  @Post(':ticketId/call')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Appeler un ticket spécifique' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async callTicket(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: CallTicketDto,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.lifecycleUseCase.callTicket(salonId, ticketId, dto.graceMinutes);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Post(':ticketId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Démarrer la prestation (Passage au fauteuil / IN_SERVICE)' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async startService(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.lifecycleUseCase.startService(salonId, ticketId);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Post(':ticketId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Terminer la prestation du ticket (DONE)',
    description:
      'Termine le ticket, clôture le rendez-vous lié si applicable et enregistre la visite dans le CRM.',
  })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async complete(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.lifecycleUseCase.completeTicket(salonId, ticketId);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Post(':ticketId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marquer que le client a quitté la file d\'attente (LEFT)' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async leave(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.lifecycleUseCase.markLeft(salonId, ticketId);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Post(':ticketId/no-show')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marquer un client appelé comme non présenté (NO_SHOW)' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async noShow(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.lifecycleUseCase.markNoShow(salonId, ticketId);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Patch(':ticketId/estimate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajuster manuellement l\'estimation d\'attente du ticket' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async updateEstimate(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateWaitEstimateDto,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.updateEstimateUseCase.execute(salonId, ticketId, dto);
    return QueueDtoMapper.toResponseDto(ticket);
  }

  @Get(':ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulter le détail d\'un ticket' })
  @ApiResponse({ status: 200, type: QueueTicketResponseDto })
  public async getById(
    @Param('salonId') salonId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketResponseDto> {
    const ticket = await this.getTicketUseCase.getById(salonId, ticketId);
    return QueueDtoMapper.toResponseDto(ticket);
  }
}
