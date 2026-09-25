import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Clé d\'idempotence unique (ex: UUID) pour éviter les doublons en cas d\'instabilité réseau',
    example: 'd9b2d63d-a233-4f9e-bf41-7c98e6f1122a',
  })
  @IsString()
  @IsNotEmpty()
  public idempotencyKey!: string;

  @ApiProperty({
    description: 'ID du client CRM du salon (SalonCustomer)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  public customerId!: string;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur app (optionnel si client non enregistré)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  public userId?: string;

  @ApiProperty({
    description: 'ID de la variante de prestation choisie',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  public variantId!: string;

  @ApiPropertyOptional({
    description: 'ID de la coiffeuse / coiffeur assigné(e)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsOptional()
  public staffId?: string;

  @ApiProperty({
    description: 'Date et heure de début souhaitée (ISO 8601)',
    example: '2026-10-15T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  public scheduledStart!: string;

  @ApiPropertyOptional({
    description: 'Prix total fixé pour la prestation (si omis, calculé selon la variante)',
    example: 25000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  public totalPrice?: number;

  @ApiPropertyOptional({
    description: 'Notes du client ou instructions particulières',
    example: 'Apporte ses propres mèches X-Pression couleur 1B',
  })
  @IsString()
  @IsOptional()
  public clientNotes?: string;
}
