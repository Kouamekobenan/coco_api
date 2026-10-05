import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { UpdateNotificationPreferencesDto } from '../../application/dtos/update-notification-preferences.dto.js';
import { ManagePreferencesUseCase } from '../../application/usecases/manage-preferences.usecase.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(private readonly managePreferencesUseCase: ManagePreferencesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Consulter les préférences de notifications de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'pref-uuid',
        userId: 'user-uuid',
        pushEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        whatsappEnabled: true,
      },
    },
  })
  public async getPreferences(@CurrentUser() user: TokenPayload) {
    return this.managePreferencesUseCase.getPreferences(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Mettre à jour les préférences de notifications' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'pref-uuid',
        userId: 'user-uuid',
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        whatsappEnabled: true,
      },
    },
  })
  public async updatePreferences(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.managePreferencesUseCase.updatePreferences(user.sub, dto);
  }
}
