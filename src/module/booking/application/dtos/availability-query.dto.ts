import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'ID de la variante de prestation pour estimer le temps requis',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  public variantId!: string;

  @ApiProperty({
    description: 'Date recherchée (format YYYY-MM-DD ou ISO 8601)',
    example: '2026-10-15',
  })
  @IsDateString()
  @IsNotEmpty()
  public date!: string;

  @ApiPropertyOptional({
    description: 'ID du staff souhaité (si omis, cherche parmi tous les coiffeurs capables)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsOptional()
  public staffId?: string;
}
