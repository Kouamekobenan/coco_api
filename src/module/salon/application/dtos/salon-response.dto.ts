import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalonCoordinatesDto {
  @ApiProperty({ example: 5.3599 })
  latitude: number;

  @ApiProperty({ example: -4.0083 })
  longitude: number;
}

export class SalonResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Salon Ébène Prestige' })
  name: string;

  @ApiProperty({ example: 'salon-ebene-prestige' })
  slug: string;

  @ApiProperty({ example: '+2250701020304' })
  phone: string;

  @ApiPropertyOptional({ example: '+2250701020304' })
  whatsappPhone?: string | null;

  @ApiPropertyOptional({ example: 'contact@ebene-prestige.ci' })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Salon de coiffure afro haut de gamme...' })
  description?: string | null;

  @ApiProperty({ example: 'COCOMOUSSO', enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  universe: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ example: 'Cocody' })
  commune: string;

  @ApiProperty({ example: 'Angré 8ème Tranche' })
  quartier: string;

  @ApiProperty({ example: 'En face de la pharmacie du 8ème' })
  landmark: string;

  @ApiProperty({ type: SalonCoordinatesDto })
  coordinates: SalonCoordinatesDto;

  @ApiPropertyOptional({ example: 'Boulevard Latrille' })
  address?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  logoUrl?: string | null;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiPropertyOptional({ example: '2026-03-01T10:00:00.000Z' })
  verifiedAt?: Date | null;

  @ApiProperty({ example: 4.8 })
  averageRating: number;

  @ApiProperty({ example: 42 })
  reviewCount: number;

  @ApiProperty({ example: '2026-01-15T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  updatedAt: Date;
}

export class NearbySalonsResponseDto {
  @ApiProperty({ type: SalonResponseDto })
  salon: SalonResponseDto;

  @ApiProperty({ example: 1.45, description: 'Distance en kilomètres' })
  distanceKm: number;
}
