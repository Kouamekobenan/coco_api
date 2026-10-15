import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Note de 1 à 5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  public rating!: number;

  @ApiPropertyOptional({
    description: 'Commentaire libre',
    example: 'Très bon accueil, tresses impeccables.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  public comment?: string;
}
