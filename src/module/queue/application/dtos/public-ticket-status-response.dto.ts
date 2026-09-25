import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueueTicketStatus, QueueType } from '@prisma/client';

export class PublicTicketStatusResponseDto {
  @ApiProperty({ description: 'Numéro de ticket (ex: W-001)' })
  public ticketNumber!: string;

  @ApiProperty({ enum: QueueType })
  public queueType!: QueueType;

  @ApiProperty({ enum: QueueTicketStatus })
  public status!: QueueTicketStatus;

  @ApiProperty({ description: 'Position actuelle dans la file (1 = prochain à passer, 0 = déjà appelé ou servi)' })
  public positionInLine!: number;

  @ApiProperty({ description: 'Nombre de clients devant dans la file' })
  public clientsAheadCount!: number;

  @ApiProperty({ description: 'Estimation d\'attente restante formatée', example: '20 - 35 min' })
  public estimatedWait!: string;

  @ApiPropertyOptional({ description: 'Heure de fin du délai de grâce pour se présenter (si CALLED)' })
  public callDeadlineAt?: string | null;

  @ApiProperty({ description: 'Nom du salon' })
  public salonName!: string;

  @ApiProperty()
  public createdAt!: string;
}
