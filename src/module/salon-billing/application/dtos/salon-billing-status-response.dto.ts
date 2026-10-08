import { ApiProperty } from '@nestjs/swagger';
import { SalonSubscriptionStatus } from '@prisma/client';
import { SalonPlanResponseDto } from './salon-plan-response.dto.js';

export class QuotaUsageDto {
  @ApiProperty({ description: 'Utilisation actuelle' })
  current: number;

  @ApiProperty({ description: 'Limite maximale autorisée (null = illimité)', nullable: true })
  max: number | null;

  @ApiProperty({ description: 'Indique si le quota est atteint' })
  isLimitReached: boolean;
}

export class SalonBillingStatusResponseDto {
  @ApiProperty({ description: 'ID de l\'abonnement' })
  id: string;

  @ApiProperty({ description: 'ID du salon' })
  salonId: string;

  @ApiProperty({ enum: SalonSubscriptionStatus, description: 'Statut de l\'abonnement' })
  status: SalonSubscriptionStatus;

  @ApiProperty({ description: 'L\'abonnement est-il valide et actif ?' })
  isValid: boolean;

  @ApiProperty({ description: 'Nombre de jours restants avant expiration' })
  remainingDays: number;

  @ApiProperty({ description: 'Date de début de l\'abonnement' })
  startDate: Date;

  @ApiProperty({ description: 'Date d\'expiration de l\'abonnement' })
  endDate: Date;

  @ApiProperty({ description: 'Date de fin de l\'essai gratuit (si applicable)', nullable: true })
  trialEndsAt: Date | null;

  @ApiProperty({ type: SalonPlanResponseDto, description: 'Détails du forfait actuel' })
  plan: SalonPlanResponseDto;

  @ApiProperty({ type: QuotaUsageDto, description: 'Consommation du quota de coiffeurs' })
  staffQuota: QuotaUsageDto;

  @ApiProperty({ type: QuotaUsageDto, description: 'Consommation du quota de prestations' })
  servicesQuota: QuotaUsageDto;
}
