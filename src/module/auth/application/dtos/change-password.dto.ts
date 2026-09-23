import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe actuel',
    example: 'AncienSecret@2026',
  })
  @IsString()
  @IsNotEmpty({ message: 'L’ancien mot de passe est obligatoire.' })
  currentPassword!: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (minimum 6 caractères)',
    example: 'NouveauSecret@2026',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
  newPassword!: string;
}
