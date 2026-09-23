import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
} from 'class-validator';

export enum AppUniverseEnum {
  COCOMOUSSO = 'COCOMOUSSO',
  COCOTAILLE = 'COCOTAILLE',
}

export class RegisterDto {
  @ApiProperty({
    description: 'Numéro de téléphone ivoirien (+225XXXXXXXXXX ou 10 chiffres ex: 0701020304)',
    example: '+2250701020304',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone!: string;

  @ApiProperty({
    description: 'Mot de passe sécurisé (minimum 6 caractères)',
    example: 'Secret@2026',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Prénom de l’utilisateur',
    example: 'Aminata',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille de l’utilisateur',
    example: 'Koné',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'aminata.kone@example.ci',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Univers préféré par défaut',
    enum: AppUniverseEnum,
    default: AppUniverseEnum.COCOMOUSSO,
  })
  @IsOptional()
  @IsEnum(AppUniverseEnum, { message: 'Univers invalide (COCOMOUSSO ou COCOTAILLE attendu).' })
  defaultUniverse?: AppUniverseEnum;
}
