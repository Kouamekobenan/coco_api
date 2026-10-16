import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlanPriceDto {
  @ApiProperty({ example: 1000, description: 'Nouveau prix mensuel en FCFA' })
  @IsNumber()
  @Min(0)
  priceMonth: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Nouveau prix annuel en FCFA (optionnel)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceYear?: number;
}
