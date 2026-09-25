import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateStaffBreakDto {
  @ApiPropertyOptional({ example: 1, description: 'Jour de la semaine récurrent (0..6) si pause fixe' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: '2026-05-15', description: 'Date ponctuelle si pause exceptionnelle' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: '13:00', description: 'Heure de début (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @ApiProperty({ example: '14:00', description: 'Heure de fin (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @ApiPropertyOptional({ example: 'Déjeuner & Prière' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class StaffBreakResponseDto {
  @ApiProperty({ example: 'break-uuid' })
  id: string;

  @ApiProperty({ example: 'staff-uuid' })
  staffId: string;

  @ApiPropertyOptional({ example: 1 })
  dayOfWeek?: number | null;

  @ApiPropertyOptional({ example: null })
  date?: string | null;

  @ApiProperty({ example: '13:00' })
  startTime: string;

  @ApiProperty({ example: '14:00' })
  endTime: string;

  @ApiPropertyOptional({ example: 'Déjeuner' })
  reason?: string | null;
}
