import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AppUniverseEnum } from './register.dto.js';

export class FindUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Numéro de la page (commence à 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d’éléments par page (max 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

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
