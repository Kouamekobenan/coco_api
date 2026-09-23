import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Access Token pour autoriser les requêtes',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh Token pour renouveler la session',
    example: 'd9b0c7e2-45f8-4b71-b0e6-8e5f2a1c9d3e...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Durée de validité de l’access token en secondes',
    example: 86400,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Profil de l’utilisateur connecté',
    type: () => UserResponseDto,
  })
  user!: UserResponseDto;
}
