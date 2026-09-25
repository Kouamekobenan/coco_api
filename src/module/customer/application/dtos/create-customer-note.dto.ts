import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerNoteDto {
  @ApiProperty({
    example: 'Cuir chevelu sensible sur la zone frontale. Préfère les mèches synthétiques X-Pression couleur 1B. N\'aime pas trop serrer les bordures.',
    description: 'Contenu de la fiche technique ou de la note privée',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu de la note est obligatoire.' })
  @MinLength(3)
  content: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Toujours privée et confidentielle au salon',
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean = true;
}

export class UpdateCustomerNoteDto {
  @ApiProperty({ example: 'Note mise à jour avec nouvelles observations...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  content: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class CustomerNoteResponseDto {
  @ApiProperty({ example: 'note-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiProperty({ example: 'customer-uuid' })
  salonCustomerId: string;

  @ApiProperty({ example: 'user-uuid', description: 'ID du coiffeur/manager auteur' })
  authorId: string;

  @ApiProperty({ example: 'Cuir chevelu sensible...' })
  content: string;

  @ApiProperty({ example: true })
  isPrivate: boolean;

  @ApiProperty({ example: '2026-02-10T11:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-10T11:00:00.000Z' })
  updatedAt: Date;
}
