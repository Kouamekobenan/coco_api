import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class StyleQueryDto {
  @ApiPropertyOptional({ enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({ example: 'braids' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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

export { StyleResponseDto } from './style-response.dto.js';

