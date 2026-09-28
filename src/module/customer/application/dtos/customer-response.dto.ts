import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';

export class CustomerResponseDto {
  @ApiProperty({ example: 'customer-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  userId?: string | null;

  @ApiProperty({ example: '+2250701020304' })
  phone: string;

  @ApiProperty({ example: 'Aminata Diallo' })
  name: string;

  @ApiPropertyOptional({ example: 'aminata.diallo@gmail.com' })
  email?: string | null;

  @ApiProperty({ example: 'VIP', enum: ['NEW', 'REGULAR', 'INACTIVE', 'VIP'] })
  segment: string;

  @ApiProperty({ example: 8, description: 'Nombre total de visites au salon' })
  visitCount: number;

  @ApiProperty({ example: 145000, description: 'Montant total dépensé en FCFA' })
  totalSpent: number;

  @ApiPropertyOptional({ example: '2026-03-12T14:30:00.000Z' })
  lastVisitAt?: Date | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-12T14:30:00.000Z' })
  updatedAt: Date;
}

export class PaginatedCustomersResponseDto extends PaginatedResponseDto<CustomerResponseDto> {
  @ApiProperty({ type: [CustomerResponseDto] })
  declare data: CustomerResponseDto[];
}
