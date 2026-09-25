import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StyleResponseDto } from './style-response.dto.js';
import { ServiceVariantResponseDto } from './service-variant-response.dto.js';

export class ServiceResponseDto {
  @ApiProperty({ example: 'service-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiPropertyOptional({ example: 'style-uuid' })
  styleId?: string | null;

  @ApiProperty({ example: 'Tresses Box Braids Complètes' })
  name: string;

  @ApiPropertyOptional({ example: 'Prestation complète avec shampoing doux...' })
  description?: string | null;

  @ApiProperty({ example: 'COCOMOUSSO', enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  universe: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiPropertyOptional({ type: StyleResponseDto })
  style?: StyleResponseDto | null;

  @ApiProperty({ type: [ServiceVariantResponseDto] })
  variants: ServiceVariantResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
