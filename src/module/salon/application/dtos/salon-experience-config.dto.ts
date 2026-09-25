import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSalonExperienceConfigDto {
  @ApiPropertyOptional({ example: 'luxury', description: 'Thème graphique' })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({ example: '#E05A47', description: 'Couleur primaire hex' })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1A1A1A', description: 'Couleur secondaire hex' })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...', description: 'Bannière vitrine' })
  @IsString()
  @IsOptional()
  coverMediaUrl?: string;

  @ApiPropertyOptional({ example: 'standard', description: 'Disposition vitrine (standard, grid, showcase)' })
  @IsString()
  @IsOptional()
  layout?: string;

  @ApiPropertyOptional({
    enum: ['APPOINTMENT', 'WALK_IN', 'HYBRID'],
    example: 'HYBRID',
    description: 'Mode de réservation : APPOINTMENT, WALK_IN, HYBRID',
  })
  @IsEnum(['APPOINTMENT', 'WALK_IN', 'HYBRID'])
  @IsOptional()
  bookingMode?: 'APPOINTMENT' | 'WALK_IN' | 'HYBRID';

  @ApiPropertyOptional({ example: true, description: 'Activer la file d\'attente digitale en temps réel' })
  @IsBoolean()
  @IsOptional()
  enableQueue?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Exiger un acompte Mobile Money pour valider la réservation' })
  @IsBoolean()
  @IsOptional()
  enableDeposit?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Activer le programme fidélité du salon' })
  @IsBoolean()
  @IsOptional()
  enableLoyalty?: boolean;

  @ApiPropertyOptional({
    example: 4,
    description: 'Nombre d\'heures avant le RDV pour annuler sans perdre son acompte',
  })
  @IsInt()
  @Min(0)
  @Max(72)
  @IsOptional()
  cancelFreeLimitHours?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Seuil en minutes pour déclencher une alerte retard cascade',
  })
  @IsInt()
  @Min(5)
  @Max(120)
  @IsOptional()
  delayAlertThresholdMin?: number;
}

export class SalonExperienceConfigResponseDto {
  @ApiProperty({ example: 'cfg-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiProperty({ example: 'default' })
  theme: string;

  @ApiProperty({ example: '#E05A47' })
  primaryColor: string;

  @ApiProperty({ example: '#1A1A1A' })
  secondaryColor: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  coverMediaUrl?: string | null;

  @ApiProperty({ example: 'standard' })
  layout: string;

  @ApiProperty({ example: 'HYBRID', enum: ['APPOINTMENT', 'WALK_IN', 'HYBRID'] })
  bookingMode: string;

  @ApiProperty({ example: true })
  enableQueue: boolean;

  @ApiProperty({ example: true })
  enableDeposit: boolean;

  @ApiProperty({ example: true })
  enableLoyalty: boolean;

  @ApiProperty({ example: 4 })
  cancelFreeLimitHours: number;

  @ApiProperty({ example: 20 })
  delayAlertThresholdMin: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
