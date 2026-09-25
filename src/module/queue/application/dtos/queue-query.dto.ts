import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueueTicketStatus, QueueType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueueQueryDto {
  @ApiPropertyOptional({ enum: QueueTicketStatus, description: 'Filtrer par statut' })
  @IsEnum(QueueTicketStatus)
  @IsOptional()
  public status?: QueueTicketStatus;

  @ApiPropertyOptional({ enum: QueueType, description: 'Filtrer par type (WALK_IN ou APPOINTMENT)' })
  @IsEnum(QueueType)
  @IsOptional()
  public queueType?: QueueType;

  @ApiPropertyOptional({ description: 'Filtrer par client CRM' })
  @IsUUID()
  @IsOptional()
  public customerId?: string;

  @ApiPropertyOptional({ description: 'Date de début du filtre (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  public dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date de fin du filtre (ISO 8601)' })
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
