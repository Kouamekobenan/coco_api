import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    example: 'Fauteuil VIP Braids 1',
    description: 'Nom du poste ou de l\'équipement',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la ressource est obligatoire.' })
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'],
    default: 'SEAT',
    example: 'SEAT',
  })
  @IsEnum(['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'])
  @IsOptional()
  type?: 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL' = 'SEAT';
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ example: 'Fauteuil Coloration 2' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'] })
  @IsEnum(['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'])
  @IsOptional()
  type?: 'SEAT' | 'WASH_BASIN' | 'CABIN' | 'SPECIAL_TOOL';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}

export class ResourceResponseDto {
  @ApiProperty({ example: 'resource-uuid' })
  id: string;

  @ApiProperty({ example: 'salon-uuid' })
  salonId: string;

  @ApiProperty({ example: 'Fauteuil VIP Braids 1' })
  name: string;

  @ApiProperty({ example: 'SEAT', enum: ['SEAT', 'WASH_BASIN', 'CABIN', 'SPECIAL_TOOL'] })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}
