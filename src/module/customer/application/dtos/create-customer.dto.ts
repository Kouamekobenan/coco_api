import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Aminata Diallo',
    description: 'Nom et prénom du client',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du client est obligatoire.' })
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '+2250701020304',
    description: 'Numéro de téléphone du client (identifiant unique chez le salon)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;

  @ApiPropertyOptional({
    example: 'aminata.diallo@gmail.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    enum: ['NEW', 'REGULAR', 'INACTIVE', 'VIP'],
    default: 'NEW',
    example: 'NEW',
  })
  @IsEnum(['NEW', 'REGULAR', 'INACTIVE', 'VIP'])
  @IsOptional()
  segment?: 'NEW' | 'REGULAR' | 'INACTIVE' | 'VIP';

  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'ID utilisateur de l\'app si déjà rattaché',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Aminata Diallo-Touré' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: '+2250701020304' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'aminata.nouvel.email@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: ['NEW', 'REGULAR', 'INACTIVE', 'VIP'] })
  @IsEnum(['NEW', 'REGULAR', 'INACTIVE', 'VIP'])
  @IsOptional()
  segment?: 'NEW' | 'REGULAR' | 'INACTIVE' | 'VIP';
}
