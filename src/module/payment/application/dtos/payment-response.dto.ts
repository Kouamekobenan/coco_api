import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentStatus, PaymentType, LedgerEntryType, LoyaltyScope, LoyaltyTxType } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public idempotencyKey!: string;

  @ApiProperty()
  public bookingId!: string;

  @ApiProperty()
  public salonId!: string;

  @ApiProperty({ enum: PaymentProvider })
  public provider!: PaymentProvider;

  @ApiPropertyOptional()
  public providerTxId?: string | null;

  @ApiPropertyOptional()
  public externalRef?: string | null;

  @ApiProperty({ description: 'Montant total payé en FCFA' })
  public amount!: number;

  @ApiProperty({ description: 'Commission plateforme Coco' })
  public commissionAmount!: number;

  @ApiProperty({ description: 'Montant net revenant au salon' })
  public netSalonAmount!: number;

  @ApiProperty()
  public currency!: string;

  @ApiProperty({ enum: PaymentType })
  public type!: PaymentType;

  @ApiProperty({ enum: PaymentStatus })
  public status!: PaymentStatus;

  @ApiPropertyOptional()
  public paidAt?: string | null;

  @ApiPropertyOptional({ description: 'URL de redirection ou lien de paiement deep-link Mobile Money' })
  public paymentUrl?: string | null;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}

export class PaymentListResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  public items!: PaymentResponseDto[];

  @ApiProperty()
  public total!: number;

  @ApiProperty()
  public page!: number;

  @ApiProperty()
  public limit!: number;

  @ApiProperty()
  public totalPages!: number;
}

export class LedgerEntryResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public salonId!: string;

  @ApiPropertyOptional()
  public paymentId?: string | null;

  @ApiProperty({ enum: LedgerEntryType })
  public entryType!: LedgerEntryType;

  @ApiProperty({ description: 'Montant du mouvement (+ ou -)' })
  public amount!: number;

  @ApiProperty({ description: 'Solde séquentiel calculé après mouvement' })
  public balanceAfter!: number;

  @ApiProperty()
  public description!: string;

  @ApiProperty()
  public createdAt!: string;
}

export class SalonLedgerResponseDto {
  @ApiProperty({ description: 'Solde séquestre / disponible actuel du salon' })
  public currentEscrowBalance!: number;

  @ApiProperty({ type: [LedgerEntryResponseDto] })
  public entries!: LedgerEntryResponseDto[];

  @ApiProperty()
  public total!: number;

  @ApiProperty()
  public page!: number;

  @ApiProperty()
  public limit!: number;

  @ApiProperty()
  public totalPages!: number;
}

export class LoyaltyTransactionResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty()
  public points!: number;

  @ApiProperty({ enum: LoyaltyTxType })
  public txType!: LoyaltyTxType;

  @ApiPropertyOptional()
  public description?: string | null;

  @ApiPropertyOptional()
  public referenceId?: string | null;

  @ApiProperty()
  public createdAt!: string;
}

export class LoyaltyAccountResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ enum: LoyaltyScope })
  public scope!: LoyaltyScope;

  @ApiPropertyOptional()
  public userId?: string | null;

  @ApiPropertyOptional()
  public salonCustomerId?: string | null;

  @ApiPropertyOptional()
  public salonId?: string | null;

  @ApiProperty({ description: 'Solde actuel de points' })
  public pointsBalance!: number;

  @ApiProperty({ type: [LoyaltyTransactionResponseDto] })
  public history!: LoyaltyTransactionResponseDto[];
}
