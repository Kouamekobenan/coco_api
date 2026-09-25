import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffTimeOffDto {
  @ApiProperty({ example: '2026-08-01T00:00:00.000Z', description: 'Début du congé (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-08-15T23:59:59.000Z', description: 'Fin du congé (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 'Congé annuel payé' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateStaffTimeOffStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';
}

export class StaffTimeOffResponseDto {
  @ApiProperty({ example: 'time-off-uuid' })
  id: string;

  @ApiProperty({ example: 'staff-uuid' })
  staffId: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-08-15T23:59:59.000Z' })
  endDate: Date;

  @ApiPropertyOptional({ example: 'Congé annuel payé' })
  reason?: string | null;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;

  @ApiProperty({ example: '2026-07-01T10:00:00.000Z' })
  createdAt: Date;
}
