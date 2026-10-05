import { NotificationChannel } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ description: 'ID du destinataire' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ description: 'ID du salon expéditeur' })
  @IsUUID()
  @IsOptional()
  salonId?: string;

  @ApiProperty({ description: 'Titre de la notification' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Corps du message' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({
    description: 'Canaux forcés (si non spécifié, utilise les préférences du user)',
    enum: NotificationChannel,
    isArray: true,
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Métadonnées contextuelles (ticketId, bookingId, url)' })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Numéro de téléphone format CI (+225...)' })
  @IsString()
  @IsOptional()
  recipientPhone?: string;
}
