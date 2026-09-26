import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSalonDto {
  @ApiPropertyOptional({
    example: 'Salon Ébène Prestige & Spa',
    description: 'Nouveau nom commercial du salon',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '+2250701020304',
    description: 'Nouveau numéro de téléphone',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: '+2250701020304',
    description: 'Nouveau numéro WhatsApp',
  })
  @IsString()
  @IsOptional()
  whatsappPhone?: string;

  @ApiPropertyOptional({
    example: 'contact@ebene-prestige.ci',
    description: 'Nouvelle adresse email',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Description actualisée du salon...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({
    example: 'Cocody',
  })
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional({
    example: 'Angré 8ème Tranche',
  })
  @IsString()
  @IsOptional()
  quartier?: string;

  @ApiPropertyOptional({
    example: 'En face de la pharmacie du 8ème, à 50m du carrefour Mandela',
  })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiPropertyOptional({
    example: 5.3599,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    example: -4.0083,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Boulevard Latrille, Immeuble Horizon',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
  })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Nouveau fichier image du logo',
  })
  @IsOptional()
  logo?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Nouveau fichier image de couverture',
  })
  @IsOptional()
  cover?: any;
}
