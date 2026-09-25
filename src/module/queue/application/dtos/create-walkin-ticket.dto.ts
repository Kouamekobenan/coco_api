import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateWalkInTicketDto {
  @ApiProperty({
    description: 'ID du client CRM du salon (SalonCustomer)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  public customerId!: string;

  @ApiPropertyOptional({
    description: 'Attente minimale estimée en minutes (si calculée manuellement)',
    example: 30,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  public estimatedWaitMin?: number;

  @ApiPropertyOptional({
    description: 'Attente maximale estimée en minutes (si calculée manuellement)',
    example: 45,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  public estimatedWaitMax?: number;
}
