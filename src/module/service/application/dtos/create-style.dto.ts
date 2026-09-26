import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStyleDto {
  @ApiProperty({
    example: 'Nappy Braids Africaines',
    description: 'Nom du style ou de la coupe de cheveux',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du style est obligatoire.' })
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'nappy-braids-africaines',
    description: 'Slug URL (généré automatiquement si absent)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
    default: 'COCOMOUSSO',
    example: 'COCOMOUSSO',
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({
    example: 'Tresses traditionnelles nappy avec rajouts synthétiques ou naturels.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    description: 'URL de l\'image d\'illustration du style',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Fichier image d\'illustration à téléverser sur Cloudinary',
  })
  @IsOptional()
  image?: any;
}

export class UpdateStyleDto {
  @ApiPropertyOptional({ example: 'Nappy Braids Pro' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'] })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'])
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiPropertyOptional({ example: 'Nouvelle description...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Nouveau fichier image d\'illustration à téléverser sur Cloudinary',
  })
  @IsOptional()
  image?: any;
}
