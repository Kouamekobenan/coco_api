import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({
    description: 'Identifiant unique matériel ou UUID généré pour cet appareil',
    example: 'd3b07384d113edec49eaa6238ad5ff00',
  })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({
    description: 'Système d\'exploitation / plateforme',
    enum: ['ios', 'android', 'web'],
    example: 'android',
  })
  @IsIn(['ios', 'android', 'web'])
  platform!: string;

  @ApiProperty({
    description: 'Token FCM (Firebase Cloud Messaging) de l\'appareil',
    example: 'fM1Z7wJ0S86...vKpQ',
  })
  @IsString()
  @IsNotEmpty()
  pushToken!: string;

  @ApiPropertyOptional({
    description: 'Version de l\'application installée',
    example: '1.2.0',
  })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
