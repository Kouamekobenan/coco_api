import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Numéro de téléphone (+225XXXXXXXXXX ou 10 chiffres ex: 0701020304)',
    example: '+2250701020304',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone!: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'Secret@2026',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  password!: string;
}
