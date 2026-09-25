import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class NearbySalonsQueryDto {
  @ApiProperty({
    example: 5.3599,
    description: 'Latitude GPS de l\'utilisateur',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty({ message: 'La latitude est obligatoire.' })
  latitude: number;

  @ApiProperty({
    example: -4.0083,
    description: 'Longitude GPS de l\'utilisateur',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty({ message: 'La longitude est obligatoire.' })
  longitude: number;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Rayon de recherche en kilomètres (max 50 km)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(50)
  @IsOptional()
  radiusKm?: number = 10;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
    description: 'Filtrer par univers Coco',
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Nombre maximal de salons à retourner',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
