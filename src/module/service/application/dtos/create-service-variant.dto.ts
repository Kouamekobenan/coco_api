import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServiceVariantDto {
  @ApiProperty({
    example: 'Mi-longues (Dos)',
    description: 'Nom de la variante (ex: Courtes, Mi-longues, Extra-longues)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la variante est obligatoire.' })
  name: string;

  @ApiProperty({
    example: 240,
    description: 'Durée minimale en minutes (ex: 240 = 4h)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMin: number;

  @ApiProperty({
    example: 300,
    description: 'Durée estimée moyenne en minutes (ex: 300 = 5h)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationEstimated: number;

  @ApiProperty({
    example: 360,
    description: 'Durée maximale de protection en minutes (ex: 360 = 6h)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMax: number;

  @ApiPropertyOptional({
    example: 15,
    default: 15,
    description: 'Temps de préparation du poste/fauteuil en minutes',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  setupMinutes?: number = 15;

  @ApiPropertyOptional({
    example: 15,
    default: 15,
    description: 'Marge tampon après prestation (repos / nettoyage)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bufferMinutes?: number = 15;

  @ApiProperty({
    example: 15000,
    description: 'Prix plancher en FCFA',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceFrom: number;

  @ApiPropertyOptional({
    example: 20000,
    description: 'Prix plafond en FCFA (optionnel si prix fixe)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceTo?: number;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Nécessite un échange/diagnostic préalable',
  })
  @IsBoolean()
  @IsOptional()
  requiresConsultation?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Exige un acompte Mobile Money pour confirmer le rendez-vous',
  })
  @IsBoolean()
  @IsOptional()
  requiresDeposit?: boolean = true;

  @ApiPropertyOptional({
    enum: ['FIXED_AMOUNT', 'PERCENTAGE'],
    default: 'FIXED_AMOUNT',
    example: 'FIXED_AMOUNT',
  })
  @IsEnum(['FIXED_AMOUNT', 'PERCENTAGE'])
  @IsOptional()
  depositRule?: 'FIXED_AMOUNT' | 'PERCENTAGE' = 'FIXED_AMOUNT';

  @ApiPropertyOptional({
    example: 2000,
    default: 2000,
    description: 'Montant de l\'acompte en FCFA ou pourcentage',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number = 2000;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Indique si la cliente doit apporter ses propres mèches/produits',
  })
  @IsBoolean()
  @IsOptional()
  requiresOwnMaterials?: boolean = false;

  @ApiPropertyOptional({
    enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'],
    example: 'SEAT',
    description: 'Ressource physique monopolisée (Fauteuil, Bac, Cabine)',
  })
  @IsEnum(['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'])
  @IsOptional()
  requiredResourceType?: 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL';
}

export class UpdateServiceVariantDto {
  @ApiPropertyOptional({ example: 'Extra-longues (Fesses)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 300 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  durationMin?: number;

  @ApiPropertyOptional({ example: 360 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  durationEstimated?: number;

  @ApiPropertyOptional({ example: 420 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  durationMax?: number;

  @ApiPropertyOptional({ example: 15 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  setupMinutes?: number;

  @ApiPropertyOptional({ example: 15 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bufferMinutes?: number;

  @ApiPropertyOptional({ example: 18000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceFrom?: number;

  @ApiPropertyOptional({ example: 25000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceTo?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  requiresConsultation?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresDeposit?: boolean;

  @ApiPropertyOptional({ enum: ['FIXED_AMOUNT', 'PERCENTAGE'] })
  @IsEnum(['FIXED_AMOUNT', 'PERCENTAGE'])
  @IsOptional()
  depositRule?: 'FIXED_AMOUNT' | 'PERCENTAGE';

  @ApiPropertyOptional({ example: 3000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresOwnMaterials?: boolean;

  @ApiPropertyOptional({ enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'] })
  @IsEnum(['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'])
  @IsOptional()
  requiredResourceType?: 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL';

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
