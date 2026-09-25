import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateWaitEstimateDto {
  @ApiProperty({ description: 'Attente minimale en minutes', example: 15 })
  @IsInt()
  @Min(0)
  public estimatedWaitMin!: number;

  @ApiProperty({ description: 'Attente maximale en minutes', example: 30 })
  @IsInt()
  @Min(0)
  public estimatedWaitMax!: number;

  @ApiPropertyOptional({ description: 'Début estimé projeté (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  public projectedStart?: string;
}
