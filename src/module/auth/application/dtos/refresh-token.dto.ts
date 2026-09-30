import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Le refresh token JWT émis lors de la connexion ou inscription',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le refresh token est obligatoire.' })
  refreshToken!: string;
}
