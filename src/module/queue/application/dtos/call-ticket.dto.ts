import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CallTicketDto {
  @ApiPropertyOptional({
    description: 'Délai de grâce en minutes avant marquage no-show si le client ne se présente pas',
    example: 10,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  public graceMinutes = 10;
}
