import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto.js';
import { AppUniverseEnum } from './register.dto.js';

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Recherche par nom, prénom, email ou téléphone',
    example: 'Aminata',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par univers',
    enum: AppUniverseEnum,
  })
  @IsOptional()
  @IsEnum(AppUniverseEnum)
  universe?: AppUniverseEnum;
}
