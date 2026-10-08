import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '@prisma/client';

export class SalonPlanResponseDto {
  @ApiProperty({ description: 'ID du plan' })
  id: string;

  @ApiProperty({ enum: PlanTier, description: 'Niveau du plan (FREE, STARTER, BUSINESS_PRO)' })
  tier: PlanTier;

  @ApiProperty({ description: 'Nom commercial du forfait' })
  name: string;

  @ApiProperty({ description: 'Prix mensuel en FCFA' })
  priceMonth: number;

  @ApiProperty({ description: 'Prix annuel en FCFA', nullable: true })
  priceYear: number | null;

  @ApiProperty({ description: 'Nombre maximum de coiffeurs autorisés (null = illimité)', nullable: true })
  maxStaff: number | null;

  @ApiProperty({ description: 'Nombre maximum de prestations autorisées (null = illimité)', nullable: true })
  maxServices: number | null;

  @ApiProperty({ description: 'Accès à la file d\'attente (Queue)' })
  enableQueue: boolean;

  @ApiProperty({ description: 'Détails des fonctionnalités', nullable: true })
  features?: Record<string, any> | null;
}
