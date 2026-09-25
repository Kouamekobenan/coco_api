import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Clé d\'idempotence unique (ex: UUID) pour éviter les double-débits Mobile Money',
    example: 'd9b2d63d-a233-4f9e-bf41-7c98e6f1122a',
  })
  @IsString()
  @IsNotEmpty()
  public idempotencyKey!: string;

  @ApiProperty({
    description: 'ID de la réservation associée',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  public bookingId!: string;

  @ApiProperty({
    enum: PaymentProvider,
    description: 'Opérateur de paiement Mobile Money ou Cash',
    example: PaymentProvider.WAVE,
  })
  @IsEnum(PaymentProvider)
  public provider!: PaymentProvider;

  @ApiProperty({
    enum: PaymentType,
    description: 'Type de versement (DEPOSIT pour acompte, FULL pour solde total, REMAINING_BALANCE pour reste à payer)',
    example: PaymentType.DEPOSIT,
  })
  @IsEnum(PaymentType)
  public type!: PaymentType;

  @ApiPropertyOptional({
    description: 'Montant en FCFA (si omis, calculé automatiquement selon la réservation)',
    example: 5000,
  })
  @IsNumber()
  @Min(100)
  @IsOptional()
  public amount?: number;
}
