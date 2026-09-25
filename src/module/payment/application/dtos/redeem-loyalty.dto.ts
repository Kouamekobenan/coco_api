import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoyaltyScope } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class RedeemLoyaltyPointsDto {
  @ApiProperty({
    enum: LoyaltyScope,
    description: 'Portée de fidélité (GLOBAL = Coco, SALON = Salon spécifique)',
    example: LoyaltyScope.SALON,
  })
  @IsEnum(LoyaltyScope)
  public scope!: LoyaltyScope;

  @ApiPropertyOptional({ description: 'ID du client CRM du salon (si scope == SALON)' })
  @IsUUID()
  @IsOptional()
  public salonCustomerId?: string;

  @ApiPropertyOptional({ description: 'ID de l\'utilisateur app (si scope == GLOBAL)' })
  @IsUUID()
  @IsOptional()
  public userId?: string;

  @ApiProperty({ description: 'Nombre de points à utiliser', example: 50 })
  @IsInt()
  @Min(1)
  public points!: number;

  @ApiPropertyOptional({ description: 'Description ou ID du rendez-vous bénéficiaire' })
  @IsString()
  @IsOptional()
  public description?: string;
}
