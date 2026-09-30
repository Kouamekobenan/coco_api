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
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { SubscribeSalonDto } from '../../application/dtos/subscribe-salon.dto.js';
import { UpdateSubscriptionPreferencesDto } from '../../application/dtos/update-subscription-preferences.dto.js';
import { SubscriptionQueryDto } from '../../application/dtos/subscription-query.dto.js';
import {
  PaginatedSubscribersResponseDto,
  SalonSubscriptionResponseDto,
  SubscriptionStatusResponseDto,
} from '../../application/dtos/salon-subscription-response.dto.js';
import { SubscribeSalonUseCase } from '../../application/usecases/subscribe-salon.usecase.js';
import { UnsubscribeSalonUseCase } from '../../application/usecases/unsubscribe-salon.usecase.js';
import { GetSubscriptionStatusUseCase } from '../../application/usecases/get-subscription-status.usecase.js';
import { GetSalonSubscribersUseCase } from '../../application/usecases/get-salon-subscribers.usecase.js';
import { UpdateSubscriptionPreferencesUseCase } from '../../application/usecases/update-subscription-preferences.usecase.js';

@ApiTags('Subscriptions')
@Controller({ path: 'salons/:salonId', version: '1' })
export class SalonSubscriptionsController {
  constructor(
    private readonly subscribeSalonUseCase: SubscribeSalonUseCase,
    private readonly unsubscribeSalonUseCase: UnsubscribeSalonUseCase,
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly getSalonSubscribersUseCase: GetSalonSubscribersUseCase,
    private readonly updatePreferencesUseCase: UpdateSubscriptionPreferencesUseCase,
  ) {}

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'S’abonner / Suivre un salon',
    description:
      'Permet à n’importe quel utilisateur connecté de s’abonner à un salon (favori, alertes promos, actualités) sans avoir besoin d’une fiche client CRM liée.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Abonnement enregistré avec succès.',
    type: SalonSubscriptionResponseDto,
  })
  public async subscribe(
    @Param('salonId') salonId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: SubscribeSalonDto,
  ): Promise<SalonSubscriptionResponseDto> {
    return this.subscribeSalonUseCase.execute(user.sub, salonId, dto);
  }

  @Delete('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se désabonner d’un salon',
    description: 'Supprime l’abonnement / suivi de l’utilisateur pour ce salon.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Désabonnement effectué.',
  })
  public async unsubscribe(
    @Param('salonId') salonId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ success: boolean; message: string }> {
    return this.unsubscribeSalonUseCase.execute(user.sub, salonId);
  }

  @Get('subscriptions/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérifier le statut d’abonnement au salon',
    description:
      'Retourne si l’utilisateur connecté est abonné, ses préférences, ainsi que le nombre total d’abonnés du salon.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SubscriptionStatusResponseDto,
  })
  public async getStatus(
    @Param('salonId') salonId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<SubscriptionStatusResponseDto> {
    return this.getSubscriptionStatusUseCase.execute(user.sub, salonId);
  }

  @Patch('subscriptions/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier les préférences de notifications pour ce salon',
    description: 'Active ou désactive les alertes promotions ou actualités/stories.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SalonSubscriptionResponseDto,
  })
  public async updatePreferences(
    @Param('salonId') salonId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateSubscriptionPreferencesDto,
  ): Promise<SalonSubscriptionResponseDto> {
    return this.updatePreferencesUseCase.execute(user.sub, salonId, dto);
  }

  @Get('subscribers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les abonnés du salon',
    description: 'Retourne la liste paginée des utilisateurs abonnés au salon et le total d’abonnés.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedSubscribersResponseDto,
  })
  public async getSubscribers(
    @Param('salonId') salonId: string,
    @Query() query: SubscriptionQueryDto,
  ): Promise<PaginatedSubscribersResponseDto> {
    return this.getSalonSubscribersUseCase.execute(salonId, query);
  }
}
