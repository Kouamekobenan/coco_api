import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateDelayDto {
  @ApiProperty({
    description: 'Nombre de minutes de décalage ou retard accumulé',
    example: 30,
  })
  @IsInt()
  @Min(0)
  public delayMinutes!: number;

  @ApiPropertyOptional({
    description: 'Indique si une alerte SMS / WhatsApp / Push a été envoyée aux clients suivants',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  public isDelayAlertSent?: boolean;
}
