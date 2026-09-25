import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSalonMediaDto {
  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    description: 'URL du média (image ou vidéo)',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'URL du média est requise.' })
  url: string;

  @ApiPropertyOptional({
    enum: ['IMAGE', 'VIDEO'],
    default: 'IMAGE',
    example: 'IMAGE',
  })
  @IsEnum(['IMAGE', 'VIDEO'])
  @IsOptional()
  mediaType?: 'IMAGE' | 'VIDEO' = 'IMAGE';

  @ApiPropertyOptional({
    enum: ['SHOWCASE', 'TEAM', 'STYLE'],
    default: 'SHOWCASE',
    example: 'SHOWCASE',
  })
  @IsEnum(['SHOWCASE', 'TEAM', 'STYLE'])
  @IsOptional()
  category?: 'SHOWCASE' | 'TEAM' | 'STYLE' = 'SHOWCASE';

  @ApiPropertyOptional({
    example: 0,
    description: 'Ordre d\'affichage',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number = 0;
}

export class MediaOrderItemDto {
  @ApiProperty({ example: 'media-uuid-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderSalonMediaDto {
  @ApiProperty({
    type: [MediaOrderItemDto],
    description: 'Liste des IDs de médias avec leur nouvel ordre',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaOrderItemDto)
  orders: MediaOrderItemDto[];
}

export class SalonMediaResponseDto {
  @ApiProperty({ example: 'media-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  url: string;

  @ApiProperty({ example: 'IMAGE' })
  mediaType: string;

  @ApiProperty({ example: 'SHOWCASE' })
  category: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: '2026-02-01T10:00:00.000Z' })
  createdAt: Date;
}
