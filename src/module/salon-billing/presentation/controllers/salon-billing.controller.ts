import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { GetSalonPlansUseCase } from '../../application/usecases/get-salon-plans.usecase.js';
import { GetSalonBillingStatusUseCase } from '../../application/usecases/get-salon-billing-status.usecase.js';
import { SubscribeSalonPlanUseCase } from '../../application/usecases/subscribe-salon-plan.usecase.js';
import { CheckExpiringSubscriptionsUseCase } from '../../application/usecases/check-expiring-subscriptions.usecase.js';
import { SalonPlanResponseDto } from '../../application/dtos/salon-plan-response.dto.js';
import { SalonBillingStatusResponseDto } from '../../application/dtos/salon-billing-status-response.dto.js';
import { SubscribePlanDto } from '../../application/dtos/subscribe-plan.dto.js';

@ApiTags('Salon Billing (Abonnements SaaS des Salons)')
@Controller({ path: 'salons', version: '1' })
export class SalonBillingController {
  constructor(
    private readonly getSalonPlansUseCase: GetSalonPlansUseCase,
    private readonly getSalonBillingStatusUseCase: GetSalonBillingStatusUseCase,
    private readonly subscribeSalonPlanUseCase: SubscribeSalonPlanUseCase,
    private readonly checkExpiringSubscriptionsUseCase: CheckExpiringSubscriptionsUseCase,
  ) {}

  @Public()
  @Get('billing/plans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter la liste des forfaits d\'abonnement disponibles',
    description: 'Renvoie les formules (Gratuit 1 mois, Starter, Business Pro) avec prix en FCFA et quotas.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des forfaits disponibles.',
    type: [SalonPlanResponseDto],
  })
  public async getPlans(): Promise<SalonPlanResponseDto[]> {
    return this.getSalonPlansUseCase.execute();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':salonId/billing/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter le statut d\'abonnement et quotas d\'un salon',
    description: 'Affiche le plan actuel, les jours restants, la validité, et la consommation des quotas (coiffeurs et prestations).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut de l\'abonnement du salon.',
    type: SalonBillingStatusResponseDto,
  })
  public async getBillingStatus(
    @Param('salonId') salonId: string,
  ): Promise<SalonBillingStatusResponseDto> {
    return this.getSalonBillingStatusUseCase.execute(salonId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':salonId/billing/subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Souscrire ou upgrader le forfait d\'un salon (Starter ou Business Pro)',
    description: 'Permet de payer et d\'activer un abonnement par Mobile Money (Wave, Orange, MTN, MoMo).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Abonnement activé ou renouvelé avec succès.',
    type: SalonBillingStatusResponseDto,
  })
  public async subscribePlan(
    @Param('salonId') salonId: string,
    @Body() dto: SubscribePlanDto,
  ): Promise<SalonBillingStatusResponseDto> {
    return this.subscribeSalonPlanUseCase.execute(salonId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('billing/cron/check-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déclencher manuellement la vérification des abonnements expirés',
    description: 'Passe les abonnements échus à EXPIRED et suspend les salons correspondants.',
  })
  public async triggerExpirationCheck(): Promise<{ expiredCount: number }> {
    return this.checkExpiringSubscriptionsUseCase.handleCron();
  }
}
