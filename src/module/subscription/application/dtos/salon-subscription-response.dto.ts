import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';

export class SubscribedSalonSummaryDto {
  @ApiProperty({ example: 'salon-uuid-123' })
  id!: string;

  @ApiProperty({ example: 'Salon Étoile Cocody' })
  name!: string;

  @ApiProperty({ example: 'salon-etoile-cocody' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../logo.jpg' })
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../cover.jpg' })
  coverUrl?: string | null;

  @ApiProperty({ example: 'Cocody' })
  commune!: string;

  @ApiProperty({ example: 'Angré 8ème Tranche' })
  quartier!: string;

  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 120 })
  reviewCount!: number;
}

export class SubscriberUserSummaryDto {
  @ApiProperty({ example: 'user-uuid-456' })
  id!: string;

  @ApiPropertyOptional({ example: 'Koffi' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Jean' })
  lastName?: string | null;

  @ApiProperty({ example: '+2250701020304' })
  phone!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../avatar.jpg' })
  avatarUrl?: string | null;
}

export class SalonSubscriptionResponseDto {
  @ApiProperty({ example: 'sub-uuid-789' })
  id!: string;

  @ApiProperty({ example: 'user-uuid-456' })
  userId!: string;

  @ApiProperty({ example: 'salon-uuid-123' })
  salonId!: string;

  @ApiProperty({ example: true, description: 'Recevoir les alertes promos' })
  notifyPromos!: boolean;

  @ApiProperty({ example: true, description: 'Recevoir les alertes stories et actus' })
  notifyStories!: boolean;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: SubscribedSalonSummaryDto })
  salon?: SubscribedSalonSummaryDto;

  @ApiPropertyOptional({ type: SubscriberUserSummaryDto })
  user?: SubscriberUserSummaryDto;
}

export class SubscriptionStatusResponseDto {
  @ApiProperty({ example: true, description: 'True si l’utilisateur connecté est abonné à ce salon' })
  isSubscribed!: boolean;

  @ApiProperty({ example: 254, description: 'Nombre total d’abonnés du salon' })
  subscribersCount!: number;

  @ApiPropertyOptional({ type: SalonSubscriptionResponseDto })
  subscription?: SalonSubscriptionResponseDto | null;
}

export class PaginatedSubscriptionsResponseDto extends PaginatedResponseDto<SalonSubscriptionResponseDto> {
  @ApiProperty({ type: [SalonSubscriptionResponseDto] })
  declare data: SalonSubscriptionResponseDto[];
}

export class PaginatedSubscribersResponseDto extends PaginatedResponseDto<SalonSubscriptionResponseDto> {
  @ApiProperty({ type: [SalonSubscriptionResponseDto] })
  declare data: SalonSubscriptionResponseDto[];
}
