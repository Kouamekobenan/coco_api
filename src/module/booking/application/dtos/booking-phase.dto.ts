import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateBookingPhaseDto {
  @ApiProperty({
    enum: PhaseType,
    description: 'Type de phase: ACTIVE (coiffeur requis) ou PASSIVE (pose soin/coloration, coiffeur libre)',
    example: PhaseType.ACTIVE,
  })
  @IsEnum(PhaseType)
  public phaseType!: PhaseType;

  @ApiProperty({
    description: 'Nom ou description de la phase',
    example: 'Application défrisage & massage crânien',
  })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiPropertyOptional({
    description: 'Ordre séquentiel d\'exécution (1, 2, 3...)',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  public sequenceOrder?: number;

  @ApiProperty({
    description: 'Durée estimée de la phase en minutes',
    example: 45,
  })
  @IsInt()
  @Min(1)
  public durationMinutes!: number;

  @ApiPropertyOptional({
    description: 'ID de la ressource monopolisée pendant la phase (fauteuil, bac, etc.)',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @IsUUID()
  @IsOptional()
  public resourceId?: string;
}

export class UpdateBookingPhaseDto {
  @ApiPropertyOptional({ enum: PhaseType })
  @IsEnum(PhaseType)
  @IsOptional()
  public phaseType?: PhaseType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public name?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  public durationMinutes?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  public resourceId?: string;
}
