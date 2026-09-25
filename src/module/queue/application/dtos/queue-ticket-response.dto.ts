import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueueTicketStatus, QueueType } from '@prisma/client';

export class QueueTicketResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public salonId!: string;

  @ApiProperty()
  public customerId!: string;

  @ApiPropertyOptional()
  public bookingId?: string | null;

  @ApiProperty({ enum: QueueType })
  public queueType!: QueueType;

  @ApiProperty({ description: 'Numéro de ticket (ex: W-001 ou A-004)', example: 'W-001' })
  public ticketNumber!: string;

  @ApiProperty({ enum: QueueTicketStatus })
  public status!: QueueTicketStatus;

  @ApiProperty({ description: 'Attente min estimée en min', example: 15 })
  public estimatedWaitMin!: number;

  @ApiProperty({ description: 'Attente max estimée en min', example: 30 })
  public estimatedWaitMax!: number;

  @ApiProperty({ description: 'Fourchette formatée', example: '15 - 30 min' })
  public formattedWait!: string;

  @ApiPropertyOptional({ description: 'Début estimé projeté (ISO 8601)' })
  public projectedStart?: string | null;

  @ApiPropertyOptional({ description: 'Horodatage de l\'appel' })
  public calledAt?: string | null;

  @ApiPropertyOptional({ description: 'Délai d\'expiration pour se présenter' })
  public callDeadlineAt?: string | null;

  @ApiPropertyOptional({ description: 'Horodatage de début de prise en charge' })
  public servedAt?: string | null;

  @ApiPropertyOptional({ description: 'Horodatage de fin' })
  public completedAt?: string | null;

  @ApiProperty({ description: 'Token de suivi QR Code public' })
  public qrCodeToken!: string;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}

export class QueueTicketListResponseDto {
  @ApiProperty({ type: [QueueTicketResponseDto] })
  public items!: QueueTicketResponseDto[];

  @ApiProperty()
  public total!: number;

  @ApiProperty()
  public page!: number;

  @ApiProperty()
  public limit!: number;

  @ApiProperty()
  public totalPages!: number;
}
