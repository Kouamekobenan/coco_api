import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';

export class StaffWorkingHourItemDto {
  @ApiProperty({ example: 1, description: 'Jour : 0 = Dimanche à 6 = Samedi' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '08:30', description: 'Début de shift (HH:mm)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @ApiProperty({ example: '18:30', description: 'Fin de shift (HH:mm)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @ApiPropertyOptional({ example: false, description: 'Jour de repos' })
  @IsBoolean()
  @IsOptional()
  isOff?: boolean = false;
}

export class UpdateStaffWorkingHoursDto {
  @ApiProperty({ type: [StaffWorkingHourItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffWorkingHourItemDto)
  hours: StaffWorkingHourItemDto[];
}

export class StaffWorkingHourResponseDto {
  @ApiProperty({ example: 'hour-uuid' })
  id: string;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: '08:30' })
  startTime: string;

  @ApiProperty({ example: '18:30' })
  endTime: string;

  @ApiProperty({ example: false })
  isOff: boolean;
}
