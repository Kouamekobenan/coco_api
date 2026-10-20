import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { GetNotificationsQueryDto } from '../../application/dtos/get-notifications-query.dto.js';
import {
  NotificationResponseDto,
  PaginatedNotificationsResponseDto,
} from '../../application/dtos/notification-response.dto.js';
import { SendNotificationDto } from '../../application/dtos/send-notification.dto.js';
import { GetUserNotificationsUseCase } from '../../application/usecases/get-user-notifications.usecase.js';
import { MarkNotificationReadUseCase } from '../../application/usecases/mark-notification-read.usecase.js';
import { MarkAllNotificationsReadUseCase } from '../../application/usecases/mark-all-notifications-read.usecase.js';
import { GetUnreadCountUseCase } from '../../application/usecases/get-unread-count.usecase.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';

import { RegisterDeviceDto } from '../../application/dtos/register-device.dto.js';
import { RegisterDeviceUseCase } from '../../application/usecases/register-device.usecase.js';
import { Delete } from '@nestjs/common';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly registerDeviceUseCase: RegisterDeviceUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consulter l\'historique des notifications de l\'utilisateur connecté',
  })
  @ApiResponse({ status: 200, type: PaginatedNotificationsResponseDto })
  public async getMyNotifications(
    @CurrentUser() user: TokenPayload,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.getUserNotificationsUseCase.execute(user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtenir le nombre de notifications non lues' })
  @ApiResponse({ status: 200, schema: { example: { unreadCount: 3 } } })
  public async getUnreadCount(@CurrentUser() user: TokenPayload): Promise<{ unreadCount: number }> {
    return this.getUnreadCountUseCase.execute(user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  public async markAsRead(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.markNotificationReadUseCase.execute(id, user.sub);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, schema: { example: { count: 5 } } })
  public async markAllAsRead(@CurrentUser() user: TokenPayload): Promise<{ count: number }> {
    return this.markAllNotificationsReadUseCase.execute(user.sub);
  }

  @Post('devices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enregistrer ou mettre à jour le token FCM d\'un appareil pour les notifications Push',
  })
  @ApiResponse({ status: 200, schema: { example: { success: true, deviceId: 'device-123' } } })
  public async registerDevice(
    @CurrentUser() user: TokenPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.registerDeviceUseCase.register(user.sub, dto);
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un appareil et désactiver ses notifications Push lors de la déconnexion',
  })
  @ApiParam({ name: 'deviceId', description: 'Identifiant du device' })
  @ApiResponse({ status: 200, schema: { example: { success: true } } })
  public async unregisterDevice(
    @CurrentUser() user: TokenPayload,
    @Param('deviceId') deviceId: string,
  ) {
    return this.registerDeviceUseCase.unregister(user.sub, deviceId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Envoyer une notification (Interne / Admin)' })
  @ApiResponse({ status: 201, description: 'Notification planifiée ou envoyée' })
  public async sendNotification(@Body() dto: SendNotificationDto) {
    return this.sendNotificationUseCase.execute(dto);
  }
}
