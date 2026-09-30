import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminPaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}

export class AdminSalonsQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Statut du salon', enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Univers (COCOTAILLE, COCOMOUSSO, MIXED)', enum: ['COCOTAILLE', 'COCOMOUSSO', 'MIXED'] })
  @IsOptional()
  @IsString()
  universe?: string;

  @ApiPropertyOptional({ description: 'Recherche par nom, slug, téléphone ou commune' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminUpdateSalonStatusDto {
  @ApiProperty({ description: 'Nouveau statut du salon', enum: ['ACTIVE', 'SUSPENDED', 'PENDING_REVIEW', 'ARCHIVED'] })
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'SUSPENDED', 'PENDING_REVIEW', 'ARCHIVED'])
  status!: string;

  @ApiPropertyOptional({ description: 'Motif de suspension ou validation (enregistré dans l\'AuditLog)' })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class AdminReassignOwnerDto {
  @ApiProperty({ description: 'ID de l\'utilisateur qui deviendra le nouveau SALON_OWNER' })
  @IsNotEmpty()
  @IsString()
  newOwnerId!: string;

  @ApiPropertyOptional({ description: 'Justification pour l\'AuditLog' })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class AdminUsersQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche par prénom, nom, téléphone (+225...) ou email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut Super-Admin' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSuperAdmin?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par statut Actif' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUpdateUserRoleDto {
  @ApiProperty({ description: 'Attribuer ou retirer les privilèges Super-Administrateur' })
  @IsNotEmpty()
  @IsBoolean()
  isSuperAdmin!: boolean;

  @ApiPropertyOptional({ description: 'Motif de la modification de privilèges' })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class AdminReviewsQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par salon ID' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par visibilité publique' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par note (1 à 5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rating?: number;
}

export class AdminModerateReviewDto {
  @ApiProperty({ description: 'Visibilité publique de l\'avis' })
  @IsNotEmpty()
  @IsBoolean()
  isPublic!: boolean;

  @ApiPropertyOptional({ description: 'Motif de la modération (ex: Propos diffamatoires, Spam, Conflit résolu)' })
  @IsOptional()
  @IsString()
  moderationReason?: string;
}

export class AdminFinanceQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par salon ID' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ description: 'Type d\'écriture comptable' })
  @IsOptional()
  @IsString()
  entryType?: string;
}

export class AdminCreatePayoutDto {
  @ApiProperty({ description: 'UUID du salon bénéficiaire' })
  @IsNotEmpty()
  @IsString()
  salonId!: string;

  @ApiProperty({ description: 'Montant en FCFA à reverser', example: 50000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ description: 'Référence du virement (Wave TX ID, Référence bancaire...)', example: 'WAVE-PAYOUT-20260930-01' })
  @IsNotEmpty()
  @IsString()
  reference!: string;

  @ApiPropertyOptional({ description: 'Description / Notes sur le reversement' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AdminUpsertSettingDto {
  @ApiProperty({ description: 'Valeur de configuration JSON (nombre, chaîne, booléen, objet)' })
  @IsNotEmpty()
  value!: any;

  @ApiPropertyOptional({ description: 'Description de la variable de configuration' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Justification pour l\'AuditLog' })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class AdminAuditLogsQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par ID d\'administrateur' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par salon ID' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par type d\'entité (Salon, User, Payment, Review, PlatformSetting)' })
  @IsOptional()
  @IsString()
  entityType?: string;
}
