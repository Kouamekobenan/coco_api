import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BillingPeriod, PaymentProvider, PlanTier } from '@prisma/client';

export class SubscribePlanDto {
  @ApiProperty({
    enum: PlanTier,
    description: 'Niveau du plan désiré (STARTER ou BUSINESS_PRO)',
    example: 'STARTER',
  })
  @IsEnum(PlanTier)
  @IsNotEmpty()
  tier: PlanTier;

  @ApiProperty({
    enum: BillingPeriod,
    description: 'Périodicité de facturation',
    default: 'MONTHLY',
    example: 'MONTHLY',
  })
  @IsEnum(BillingPeriod)
  @IsOptional()
  period?: BillingPeriod = BillingPeriod.MONTHLY;

  @ApiProperty({
    enum: PaymentProvider,
    description: 'Opérateur de paiement Mobile Money',
    example: 'WAVE',
  })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Numéro de téléphone payeur (+225...)',
    example: '+2250701020304',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
