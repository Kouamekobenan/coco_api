import { NotificationChannel } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par état de lecture' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par canal', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiPropertyOptional({ description: 'Filtrer par salon expéditeur' })
  @IsUUID()
  @IsOptional()
  salonId?: string;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments à passer', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number = 0;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments à récupérer', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  take?: number = 20;
}
