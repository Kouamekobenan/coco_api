import { ApiProperty } from '@nestjs/swagger';
import { QueueTicketResponseDto } from './queue-ticket-response.dto.js';

export class LiveQueueDashboardResponseDto {
  @ApiProperty({ description: 'ID du salon' })
  public salonId!: string;

  @ApiProperty({ description: 'Nombre total de personnes en attente' })
  public waitingCount!: number;

  @ApiProperty({ description: 'Nombre de personnes appelées (en transit vers le fauteuil)' })
  public calledCount!: number;

  @ApiProperty({ description: 'Nombre de personnes actuellement en prestation' })
  public inServiceCount!: number;

  @ApiProperty({ description: 'Estimation moyenne d\'attente en minutes pour un nouvel arrivant' })
  public estimatedAverageWaitMin!: number;

  @ApiProperty({ type: [QueueTicketResponseDto], description: 'Tickets actuellement appelés' })
  public currentlyCalled!: QueueTicketResponseDto[];

  @ApiProperty({ type: [QueueTicketResponseDto], description: 'Tickets actuellement en prestation' })
  public currentlyInService!: QueueTicketResponseDto[];

  @ApiProperty({ type: [QueueTicketResponseDto], description: 'Tickets en file d\'attente ordonnés' })
  public waitingQueue!: QueueTicketResponseDto[];
}
