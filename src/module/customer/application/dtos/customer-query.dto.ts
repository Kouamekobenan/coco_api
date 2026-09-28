import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto.js';

export class CustomerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['NEW', 'REGULAR', 'INACTIVE', 'VIP'],
    description: 'Filtrer par segment client',
  })
  @IsEnum(['NEW', 'REGULAR', 'INACTIVE', 'VIP'])
  @IsOptional()
  segment?: 'NEW' | 'REGULAR' | 'INACTIVE' | 'VIP';

  @ApiPropertyOptional({
    example: 'Aminata',
    description: 'Recherche par nom ou numéro de téléphone',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
