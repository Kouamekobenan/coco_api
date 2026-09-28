import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto.js';

export class SalonQueryDto extends PaginationQueryDto {

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
