import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAppointmentTicketDto {
  @ApiProperty({
    description: 'ID de la réservation confirmée existante (Booking)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  public bookingId!: string;
}
