import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'Firebase ID Token obtenu après vérification du code OTP par SMS via Firebase Phone Auth côté client (Flutter / React Native / Web)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...w',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le jeton Firebase (firebaseIdToken) est obligatoire.' })
  firebaseIdToken!: string;

  @ApiProperty({
    description: 'Nouveau mot de passe sécurisé (minimum 6 caractères)',
    example: 'NouveauSecret@2026',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
  newPassword!: string;

  @ApiPropertyOptional({
    description:
      'Numéro de téléphone (optionnel pour double vérification avec le numéro certifié par Firebase)',
    example: '+2250701020304',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
