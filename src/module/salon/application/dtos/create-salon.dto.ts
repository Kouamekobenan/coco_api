import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSalonDto {
  @ApiProperty({
    example: 'Salon Ébène Prestige',
    description: 'Nom commercial du salon',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du salon est obligatoire.' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  name: string;

  @ApiPropertyOptional({
    example: 'salon-ebene-prestige',
    description: 'Slug URL personnalisé. Si non fourni, il est automatiquement généré à partir du nom.',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: '+2250701020304',
    description: 'Numéro de téléphone principal du salon (+225)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;

  @ApiPropertyOptional({
    example: '+2250701020304',
    description: 'Numéro WhatsApp pour prise de contact ou confirmation',
  })
  @IsString()
  @IsOptional()
  whatsappPhone?: string;

  @ApiPropertyOptional({
    example: 'contact@ebene-prestige.ci',
    description: 'Adresse email professionnelle du salon',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Salon de coiffure afro haut de gamme, spécialisé en nappy hair, tresses fines et colorations naturelles.',
    description: 'Description de présentation de la vitrine',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['COCOMOUSSO', 'COCOTAILLE', 'MIXED'],
    default: 'MIXED',
    example: 'COCOMOUSSO',
    description: 'Univers Coco : COCOMOUSSO (Femme), COCOTAILLE (Barbershop Homme), MIXED',
  })
  @IsEnum(['COCOMOUSSO', 'COCOTAILLE', 'MIXED'], {
    message: 'L\'univers doit être COCOMOUSSO, COCOTAILLE ou MIXED.',
  })
  @IsOptional()
  universe?: 'COCOMOUSSO' | 'COCOTAILLE' | 'MIXED';

  @ApiProperty({
    example: 'Cocody',
    description: 'Commune d\'Abidjan ou de Côte d\'Ivoire (ex: Cocody, Marcory, Yopougon, Plateau...)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La commune est obligatoire.' })
  commune: string;

  @ApiProperty({
    example: 'Angré 8ème Tranche',
    description: 'Quartier (ex: Angré 8ème Tranche, Biétry, Niangon, Vallon...)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le quartier est obligatoire.' })
  quartier: string;

  @ApiProperty({
    example: 'En face de la pharmacie du 8ème, à 50m du carrefour Mandela',
    description: 'Repère visuel essentiel pour guider les clients ivoiriens',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le repère (landmark) est essentiel pour la localisation en Côte d\'Ivoire.' })
  landmark: string;

  @ApiProperty({
    example: 5.3599,
    description: 'Latitude GPS (Abidjan ~ 5.36)',
  })
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: -4.0083,
    description: 'Longitude GPS (Abidjan ~ -4.01)',
  })
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    example: 'Boulevard Latrille, Immeuble Horizon, 1er étage',
    description: 'Adresse physique détaillée ou complémentaire',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    description: 'Image de couverture vitrine',
  })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
    description: 'Logo du salon',
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
