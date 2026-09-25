import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WebhookPayloadDto {
  @ApiPropertyOptional({ description: 'ID de transaction de l\'opérateur' })
  @IsString()
  @IsOptional()
  public transactionId?: string;

  @ApiPropertyOptional({ description: 'Statut retourné par l\'opérateur (ex: SUCCESSFUL, FAILED)' })
  @IsString()
  @IsOptional()
  public status?: string;

  @ApiPropertyOptional({ description: 'Clé d\'idempotence ou référence client transmise à l\'initiation' })
  @IsString()
  @IsOptional()
  public idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'Référence externe' })
  @IsString()
  @IsOptional()
  public externalRef?: string;

  @ApiPropertyOptional({ description: 'Signature cryptographique pour vérification HMAC' })
  @IsString()
  @IsOptional()
  public signature?: string;
}
