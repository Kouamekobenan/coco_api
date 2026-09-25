import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class PaymentQueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filtrer par statut' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  public status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentProvider, description: 'Filtrer par opérateur' })
  @IsEnum(PaymentProvider)
  @IsOptional()
  public provider?: PaymentProvider;

  @ApiPropertyOptional({ enum: PaymentType, description: 'Filtrer par type' })
  @IsEnum(PaymentType)
  @IsOptional()
  public type?: PaymentType;

  @ApiPropertyOptional({ description: 'Filtrer par réservation' })
  @IsUUID()
  @IsOptional()
  public bookingId?: string;

  @ApiPropertyOptional({ description: 'Date de début (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  public dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  public dateTo?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  public page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  public limit = 20;
}
