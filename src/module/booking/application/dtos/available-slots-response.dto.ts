import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimeSlotOptionDto {
  @ApiProperty({ description: 'Début du créneau (ISO 8601)', example: '2026-10-15T09:00:00.000Z' })
  public start!: string;

  @ApiProperty({ description: 'Fin prévisionnelle (ISO 8601)', example: '2026-10-15T15:30:00.000Z' })
  public projectedEnd!: string;

  @ApiProperty({ description: 'Fin pire des cas (ISO 8601)', example: '2026-10-15T17:00:00.000Z' })
  public worstCaseEnd!: string;

  @ApiPropertyOptional({ description: 'ID du staff disponible' })
  public staffId?: string;

  @ApiPropertyOptional({ description: 'Nom complet du coiffeur' })
  public staffName?: string;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({ description: 'Date analysée (YYYY-MM-DD)' })
  public date!: string;

  @ApiProperty({ description: 'ID de la variante analysée' })
  public variantId!: string;

  @ApiProperty({ description: 'Durée totale prévisionnelle en minutes (setup + estimated + buffer)' })
  public totalEstimatedMinutes!: number;

  @ApiProperty({ type: [TimeSlotOptionDto], description: 'Liste des créneaux horaires disponibles' })
  public availableSlots!: TimeSlotOptionDto[];
}
