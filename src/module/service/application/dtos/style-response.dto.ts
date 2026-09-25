import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StyleResponseDto {
  @ApiProperty({ example: 'style-uuid' })
  id: string;

  @ApiProperty({ example: 'Nappy Braids' })
  name: string;

  @ApiProperty({ example: 'nappy-braids' })
  slug: string;

  @ApiProperty({ example: 'COCOMOUSSO', enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  universe: string;

  @ApiPropertyOptional({ example: 'Description du style...' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  imageUrl?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}
