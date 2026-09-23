import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppUniverseEnum } from './register.dto.js';

export class UpdateProfileDto {
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
    description: 'URL de l’avatar',
    example: 'https://cdn.coco.ci/avatars/user.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Univers préféré par défaut',
    enum: AppUniverseEnum,
  })
  @IsOptional()
  @IsEnum(AppUniverseEnum, { message: 'Univers invalide (COCOMOUSSO ou COCOTAILLE attendu).' })
  defaultUniverse?: AppUniverseEnum;
}
