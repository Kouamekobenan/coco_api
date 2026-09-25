import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Tresses Box Braids Complètes',
    description: 'Nom du service/prestation proposé par le salon',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du service est obligatoire.' })
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    example: 'style-uuid',
    description: 'Identifiant du style associé (optionnel, pour rattachement catalogue)',
  })
  @IsString()
  @IsOptional()
  styleId?: string;

  @ApiPropertyOptional({
    example: 'Prestation complète comprenant shampoing doux, démêlage et tressage soigné.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
    default: 'COCOMOUSSO',
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({
    example: 0,
    description: 'Ordre d\'affichage sur la carte du salon',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number = 0;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Box Braids Royales' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'style-uuid' })
  @IsString()
  @IsOptional()
  styleId?: string;

  @ApiPropertyOptional({ example: 'Description mise à jour...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
