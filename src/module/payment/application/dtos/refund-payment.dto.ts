import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description: 'Montant partiel à rembourser (si omis, remboursement intégral)',
    example: 2000,
  })
  @IsNumber()
  @Min(100)
  @IsOptional()
  public amount?: number;

  @ApiPropertyOptional({
    description: 'Motif du remboursement',
    example: 'Annulation dans les délais autorisés',
  })
  @IsString()
  @IsOptional()
  public reason?: string;
}
