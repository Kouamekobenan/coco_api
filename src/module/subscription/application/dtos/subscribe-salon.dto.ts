import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class SubscribeSalonDto {
  @ApiPropertyOptional({
    description: 'Recevoir les alertes de promotions et bons plans du salon',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyPromos?: boolean;

  @ApiPropertyOptional({
    description: 'Recevoir les actualités et nouvelles coiffures/stories du salon',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyStories?: boolean;
}
