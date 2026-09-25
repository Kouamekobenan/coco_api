import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceVariantResponseDto {
  @ApiProperty({ example: 'variant-uuid' })
  id: string;

  @ApiProperty({ example: 'service-uuid' })
  serviceId: string;

  @ApiProperty({ example: 'Mi-longues (Dos)' })
  name: string;

  @ApiProperty({ example: 240, description: 'Durée minimale en minutes' })
  durationMin: number;

  @ApiProperty({ example: 300, description: 'Durée estimée moyenne en minutes' })
  durationEstimated: number;

  @ApiProperty({ example: 360, description: 'Durée maximale en minutes' })
  durationMax: number;

  @ApiProperty({ example: 15, description: 'Préparation du poste en minutes' })
  setupMinutes: number;

  @ApiProperty({ example: 15, description: 'Marge tampon en minutes' })
  bufferMinutes: number;

  @ApiProperty({ example: 330, description: 'Temps total réservé sur le créneau (setup + estimated + buffer)' })
  totalProjectedMinutes: number;

  @ApiProperty({ example: 15000, description: 'Prix plancher en FCFA' })
  priceFrom: number;

  @ApiPropertyOptional({ example: 20000, description: 'Prix plafond en FCFA' })
  priceTo?: number | null;

  @ApiProperty({ example: false })
  requiresConsultation: boolean;

  @ApiProperty({ example: true })
  requiresDeposit: boolean;

  @ApiProperty({ example: 'FIXED_AMOUNT', enum: ['FIXED_AMOUNT', 'PERCENTAGE'] })
  depositRule: string;

  @ApiProperty({ example: 2000 })
  depositAmount: number;

  @ApiProperty({ example: false, description: 'Mèches fournies par cliente' })
  requiresOwnMaterials: boolean;

  @ApiProperty({ example: true, description: 'Prestation longue nécessitant des pauses (>= 5h)' })
  isLongService: boolean;

  @ApiPropertyOptional({ example: 'SEAT', enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'] })
  requiredResourceType?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}
