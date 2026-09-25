import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SalonHourItemDto {
  @ApiProperty({
    example: 1,
    description: 'Jour de la semaine : 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    example: '08:30',
    description: 'Heure d\'ouverture au format HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'L\'heure d\'ouverture doit être au format HH:mm (ex: 08:30).',
  })
  openTime: string;

  @ApiProperty({
    example: '19:30',
    description: 'Heure de fermeture au format HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'L\'heure de fermeture doit être au format HH:mm (ex: 19:30).',
  })
  closeTime: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indique si le salon est fermé ce jour',
  })
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean = false;
}

export class UpdateSalonHoursDto {
  @ApiProperty({
    type: [SalonHourItemDto],
    description: 'Liste des horaires pour chaque jour de la semaine',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalonHourItemDto)
  hours: SalonHourItemDto[];
}

export class CreateSalonHourExceptionDto {
  @ApiProperty({
    example: '2026-08-07',
    description: 'Date de l\'exception (format YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La date doit être au format ISO (ex: 2026-08-07).' })
  @IsNotEmpty({ message: 'La date est obligatoire.' })
  date: string;

  @ApiPropertyOptional({
    example: '10:00',
    description: 'Heure d\'ouverture exceptionnelle (si ouvert)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Format HH:mm attendu.' })
  @IsOptional()
  openTime?: string;

  @ApiPropertyOptional({
    example: '16:00',
    description: 'Heure de fermeture exceptionnelle (si ouvert)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Format HH:mm attendu.' })
  @IsOptional()
  closeTime?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Fermé toute la journée',
  })
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean = true;

  @ApiPropertyOptional({
    example: 'Fête de l\'Indépendance de la Côte d\'Ivoire',
    description: 'Motif du jour férié ou de la fermeture',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SalonHourResponseDto {
  @ApiProperty({ example: 'hour-uuid' })
  id: string;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: '08:30' })
  openTime: string;

  @ApiProperty({ example: '19:30' })
  closeTime: string;

  @ApiProperty({ example: false })
  isClosed: boolean;
}

export class SalonHourExceptionResponseDto {
  @ApiProperty({ example: 'exc-uuid' })
  id: string;

  @ApiProperty({ example: '2026-08-07' })
  date: string;

  @ApiPropertyOptional({ example: null })
  openTime?: string | null;

  @ApiPropertyOptional({ example: null })
  closeTime?: string | null;

  @ApiProperty({ example: true })
  isClosed: boolean;

  @ApiPropertyOptional({ example: 'Fête de l\'Indépendance' })
  reason?: string | null;
}
