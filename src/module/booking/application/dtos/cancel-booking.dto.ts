import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({
    description: 'Motif de l\'annulation de la réservation',
    example: 'Empêchement imprévu de la cliente',
  })
  @IsString()
  @IsOptional()
  public reason?: string;
}
