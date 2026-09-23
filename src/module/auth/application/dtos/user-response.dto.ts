import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '+2250701020304' })
  phone!: string;

  @ApiProperty({ example: '07 01 02 03 04' })
  nationalPhone!: string;

  @ApiPropertyOptional({ example: 'aminata.kone@example.ci' })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Aminata' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Koné' })
  lastName?: string | null;

  @ApiProperty({ example: 'Aminata Koné' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'https://cdn.coco.ci/avatars/user.jpg' })
  avatarUrl?: string | null;

  @ApiProperty({ example: 'COCOMOUSSO' })
  defaultUniverse!: string;

  @ApiProperty({ example: false })
  isPhoneVerified!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isSuperAdmin!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
