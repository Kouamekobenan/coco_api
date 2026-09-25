import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CustomerQueryDto {
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

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
