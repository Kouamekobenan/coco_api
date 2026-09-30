import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la session',
    example: 'd9b2d63d-a233-4f9e-a0e2-63b784a91901',
  })
  id!: string;

  @ApiPropertyOptional({
    description: 'Adresse IP lors de la connexion',
    example: '160.155.10.42',
  })
  ipAddress?: string | null;

  @ApiPropertyOptional({
    description: 'Navigateur ou application client (User Agent)',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  })
  userAgent?: string | null;

  @ApiPropertyOptional({
    description: 'Identifiant de l’appareil client',
    example: 'device_iphone_15_pro',
  })
  deviceId?: string | null;

  @ApiProperty({
    description: 'Date d’expiration de la session',
  })
  expiresAt!: Date;

  @ApiProperty({
    description: 'Date de création de la session (dernière connexion)',
  })
  createdAt!: Date;
}
