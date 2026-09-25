import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'Identifiant du compte utilisateur (si le coiffeur a créé son compte sur l\'app)',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: 'Awa',
    description: 'Prénom du coiffeur ou de la coiffeuse',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @MinLength(2)
  @MaxLength(60)
  firstName: string;

  @ApiProperty({
    example: 'Koné',
    description: 'Nom de famille',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MinLength(2)
  @MaxLength(60)
  lastName: string;

  @ApiPropertyOptional({
    example: 'Awa Braids Expert',
    description: 'Nom d\'artiste ou nom commercial affiché aux clientes',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    example: '+2250701020304',
    description: 'Numéro de téléphone direct du coiffeur',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    description: 'Photo de profil / avatar',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Passionnée de nappy hair et coiffures protectrices depuis 8 ans.',
    description: 'Courte biographie ou présentation',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    example: 'Spécialiste Braids & Locks Senior',
    description: 'Titre de rôle affiché dans l\'équipe',
  })
  @IsString()
  @IsOptional()
  roleTitle?: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 'Awa' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Koné' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Awa Queen of Braids' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ example: '+2250701020304' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Bio mise à jour...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'Master Coloriste' })
  @IsString()
  @IsOptional()
  roleTitle?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
