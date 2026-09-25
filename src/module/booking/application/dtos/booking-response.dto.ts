import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, PhaseType } from '@prisma/client';

export class BookingPhaseResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public bookingId!: string;

  @ApiProperty({ enum: PhaseType })
  public phaseType!: PhaseType;

  @ApiProperty()
  public name!: string;

  @ApiProperty()
  public sequenceOrder!: number;

  @ApiProperty()
  public durationMinutes!: number;

  @ApiPropertyOptional()
  public resourceId?: string | null;

  @ApiPropertyOptional()
  public startedAt?: string | null;

  @ApiPropertyOptional()
  public endedAt?: string | null;
}

export class BookingResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public idempotencyKey!: string;

  @ApiProperty()
  public salonId!: string;

  @ApiProperty()
  public customerId!: string;

  @ApiPropertyOptional()
  public userId?: string | null;

  @ApiProperty()
  public variantId!: string;

  @ApiPropertyOptional()
  public staffId?: string | null;

  @ApiProperty({ enum: BookingStatus })
  public status!: BookingStatus;

  @ApiProperty({ description: 'Date de début convenue (ISO 8601)' })
  public scheduledStart!: string;

  @ApiProperty({ description: 'Date de fin estimée (ISO 8601)' })
  public projectedEnd!: string;

  @ApiProperty({ description: 'Date de fin maximale de protection (ISO 8601)' })
  public worstCaseEnd!: string;

  @ApiPropertyOptional()
  public actualStart?: string | null;

  @ApiPropertyOptional()
  public actualEnd?: string | null;

  @ApiProperty({ description: 'Dérive ou retard en minutes' })
  public delayMinutes!: number;

  @ApiProperty()
  public isDelayAlertSent!: boolean;

  @ApiProperty({ description: 'Montant de l\'acompte en FCFA' })
  public depositAmount!: number;

  @ApiProperty({ description: 'Prix total convenu en FCFA' })
  public totalPrice!: number;

  @ApiProperty()
  public isDepositPaid!: boolean;

  @ApiPropertyOptional()
  public depositPaidAt?: string | null;

  @ApiPropertyOptional({ description: 'Expiration du verrou temporaire pour paiement de l\'acompte (15 min)' })
  public holdExpiresAt?: string | null;

  @ApiPropertyOptional()
  public cancellationReason?: string | null;

  @ApiPropertyOptional()
  public cancelledAt?: string | null;

  @ApiPropertyOptional()
  public rescheduledFromId?: string | null;

  @ApiPropertyOptional()
  public clientNotes?: string | null;

  @ApiProperty({ type: [BookingPhaseResponseDto] })
  public phases!: BookingPhaseResponseDto[];

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  public items!: BookingResponseDto[];

  @ApiProperty()
  public total!: number;

  @ApiProperty()
  public page!: number;

  @ApiProperty()
  public limit!: number;

  @ApiProperty()
  public totalPages!: number;
}
