import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubscriptionPreferencesDto {
  @ApiPropertyOptional({
    description: 'Recevoir les alertes de promotions et bons plans du salon',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyPromos?: boolean;

  @ApiPropertyOptional({
    description: 'Recevoir les actualités et nouvelles coiffures/stories du salon',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  notifyStories?: boolean;
}
