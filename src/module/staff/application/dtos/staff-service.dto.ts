import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AssignStaffServiceDto {
  @ApiProperty({ example: 'service-uuid', description: 'ID de la prestation' })
  @IsString()
  @IsNotEmpty({ message: 'L\'identifiant du service est obligatoire.' })
  serviceId: string;

  @ApiPropertyOptional({ example: 'variant-uuid', description: 'ID de la variante spécifique' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({ example: 180, description: 'Durée minimale personnalisée pour ce coiffeur (min)' })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationMin?: number;

  @ApiPropertyOptional({ example: 240, description: 'Durée médiane estimée personnalisée (min)' })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationEstimated?: number;

  @ApiPropertyOptional({ example: 300, description: 'Durée maximale personnalisée (min)' })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationMax?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isCapable?: boolean = true;
}

export class UpdateStaffServiceDto {
  @ApiPropertyOptional({ example: 180 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationMin?: number;

  @ApiPropertyOptional({ example: 240 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationEstimated?: number;

  @ApiPropertyOptional({ example: 300 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @IsOptional()
  customDurationMax?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isCapable?: boolean;
}

export class StaffServiceResponseDto {
  @ApiProperty({ example: 'staff-service-uuid' })
  id: string;

  @ApiProperty({ example: 'staff-uuid' })
  staffId: string;

  @ApiProperty({ example: 'service-uuid' })
  serviceId: string;

  @ApiPropertyOptional({ example: 'variant-uuid' })
  variantId?: string | null;

  @ApiPropertyOptional({ example: 180 })
  customDurationMin?: number | null;

  @ApiPropertyOptional({ example: 240 })
  customDurationEstimated?: number | null;

  @ApiPropertyOptional({ example: 300 })
  customDurationMax?: number | null;

  @ApiProperty({ example: true })
  isCapable: boolean;
}
