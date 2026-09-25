import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SalonQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Numéro de page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Nombre de résultats par page (max 100)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'braids',
    description: 'Recherche textuelle (nom, description, landmark, quartier, commune)',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
    description: 'Filtrer par univers Coco',
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({
    example: 'Cocody',
    description: 'Filtrer par commune',
  })
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional({
    example: 'Angré',
    description: 'Filtrer par quartier',
  })
  @IsString()
  @IsOptional()
  quartier?: string;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'],
    description: 'Filtrer par statut',
  })
  @IsEnum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

  @ApiPropertyOptional({
    example: true,
    description: 'Filtrer uniquement les salons vérifiés/certifiés',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
