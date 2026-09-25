import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaffResponseDto {
  @ApiProperty({ example: 'staff-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  userId?: string | null;

  @ApiProperty({ example: 'Awa' })
  firstName: string;

  @ApiProperty({ example: 'Koné' })
  lastName: string;

  @ApiPropertyOptional({ example: 'Awa Braids Expert' })
  displayName?: string | null;

  @ApiProperty({ example: 'Awa Braids Expert' })
  fullName: string;

  @ApiProperty({ example: '+2250701020304' })
  phone: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: 'Passionnée de nappy hair...' })
  bio?: string | null;

  @ApiPropertyOptional({ example: 'Spécialiste Braids' })
  roleTitle?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
