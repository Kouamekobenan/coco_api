import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSalonPromotionDto {
  @ApiProperty({
    example: 'Promo Tabaski -20%',
    description: 'Titre de la promotion',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  title: string;

  @ApiPropertyOptional({
    example: 'Profitez de -20% sur tous les tissages et tresses pour la fête.',
    description: 'Description détaillée de l\'offre',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    example: 'PERCENTAGE',
    description: 'Type de remise : PERCENTAGE ou FIXED_AMOUNT (en FCFA)',
  })
  @IsEnum(['PERCENTAGE', 'FIXED_AMOUNT'])
  @IsNotEmpty()
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiProperty({
    example: 20,
    description: 'Valeur de la réduction (ex: 20 pour 20%, ou 5000 pour 5000 FCFA)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  discountValue: number;

  @ApiProperty({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Date de début de validité (ISO)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-06-30T23:59:59.000Z',
    description: 'Date de fin de validité (ISO)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateSalonPromotionDto {
  @ApiPropertyOptional({ example: 'Promo Tabaski -25%' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Description actualisée...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  @IsEnum(['PERCENTAGE', 'FIXED_AMOUNT'])
  @IsOptional()
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiPropertyOptional({ example: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SalonPromotionResponseDto {
  @ApiProperty({ example: 'promo-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiProperty({ example: 'Promo Tabaski -20%' })
  title: string;

  @ApiPropertyOptional({ example: 'Description...' })
  description?: string | null;

  @ApiProperty({ example: 'PERCENTAGE', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  discountType: string;

  @ApiProperty({ example: 20 })
  discountValue: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-06-30T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Promotion actuellement active et en cours selon la date' })
  isValidNow: boolean;

  @ApiProperty({ example: '2026-05-15T10:00:00.000Z' })
  createdAt: Date;
}
