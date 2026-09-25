import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateSalonStatusDto {
  @ApiProperty({
    enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'],
    example: 'ACTIVE',
    description: 'Nouveau statut du salon',
  })
  @IsEnum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'], {
    message: 'Le statut doit être DRAFT, PENDING_REVIEW, ACTIVE, SUSPENDED ou ARCHIVED.',
  })
  @IsNotEmpty({ message: 'Le statut est obligatoire.' })
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}
