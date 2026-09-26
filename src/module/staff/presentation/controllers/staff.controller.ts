import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStaffDto, UpdateStaffDto } from '../../application/dtos/create-staff.dto.js';
import { StaffResponseDto } from '../../application/dtos/staff-response.dto.js';
import {
  CreateStaffUseCase,
  DeleteStaffUseCase,
  GetSalonStaffUseCase,
  GetStaffByIdUseCase,
  UpdateStaffUseCase,
  UploadStaffAvatarUseCase,
} from '../../application/usecases/staff.usecase.js';
import { Public } from '../../../auth/infrastructure/security/public.decorator.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import 'multer';

@ApiTags('Staff — Équipe & Coiffeurs')
@Controller({ path: 'salons/:salonId/staff', version: '1' })
export class StaffController {
  constructor(
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly getSalonStaffUseCase: GetSalonStaffUseCase,
    private readonly getStaffByIdUseCase: GetStaffByIdUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly uploadStaffAvatarUseCase: UploadStaffAvatarUseCase,
    private readonly deleteStaffUseCase: DeleteStaffUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de création d\'un membre du staff avec photo de profil',
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          example: 'Awa',
          description: 'Prénom du coiffeur / coiffeuse',
        },
        lastName: {
          type: 'string',
          example: 'Koné',
          description: 'Nom de famille',
        },
        displayName: {
          type: 'string',
          example: 'Awa Braids Expert',
          description: 'Nom commercial ou d\'artiste',
        },
        phone: {
          type: 'string',
          example: '+2250701020304',
          description: 'Téléphone direct (+225)',
        },
        userId: {
          type: 'string',
          example: 'user-uuid',
          description: 'ID utilisateur associé (optionnel)',
        },
        roleTitle: {
          type: 'string',
          example: 'Spécialiste Braids & Locks Senior',
          description: 'Titre de rôle affiché dans l\'équipe',
        },
        bio: {
          type: 'string',
          example: 'Passionnée de nappy hair et coiffures protectrices depuis 8 ans.',
          description: 'Courte biographie',
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Fichier photo de profil / avatar (Cloudinary)',
        },
        avatarUrl: {
          type: 'string',
          example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          description: 'URL directe de la photo (optionnelle)',
        },
      },
      required: ['firstName', 'lastName', 'phone'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter un membre dans l’équipe du salon',
    description: 'Enregistre un coiffeur, tresseuse, barbier ou coloriste avec sa photo (Cloudinary).',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Membre du staff créé avec succès.',
    type: StaffResponseDto,
  })
  public async create(
    @Param('salonId') salonId: string,
    @Body() dto: CreateStaffDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<StaffResponseDto> {
    return this.createStaffUseCase.execute(salonId, dto, avatarFile);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter l’équipe des coiffeurs du salon',
    description: 'Retourne la liste des coiffeurs / barbiers du salon avec photos et spécialités.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membres du staff trouvés.',
    type: [StaffResponseDto],
  })
  public async findBySalon(
    @Param('salonId') salonId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<StaffResponseDto[]> {
    const filterActive = onlyActive !== 'false';
    return this.getSalonStaffUseCase.execute(salonId, filterActive);
  }

  @Public()
  @Get(':staffId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir la fiche profil d’un coiffeur',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil du coiffeur.',
    type: StaffResponseDto,
  })
  public async findById(@Param('staffId') staffId: string): Promise<StaffResponseDto> {
    return this.getStaffByIdUseCase.execute(staffId);
  }

  @Patch(':staffId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulaire de modification d\'un membre du staff avec photo de profil',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Awa' },
        lastName: { type: 'string', example: 'Koné' },
        displayName: { type: 'string', example: 'Awa Queen of Braids' },
        phone: { type: 'string', example: '+2250701020304' },
        userId: { type: 'string', example: 'user-uuid' },
        roleTitle: { type: 'string', example: 'Master Coloriste' },
        bio: { type: 'string', example: 'Bio mise à jour...' },
        isActive: { type: 'boolean', example: true },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Nouvelle photo de profil (Cloudinary)',
        },
        avatarUrl: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier les informations d’un coiffeur',
    description: 'Met à jour le profil d\'un coiffeur avec option de téléverser sa nouvelle photo sur Cloudinary.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil mis à jour.',
    type: StaffResponseDto,
  })
  public async update(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<StaffResponseDto> {
    return this.updateStaffUseCase.execute(salonId, staffId, dto, avatarFile);
  }

  @Post(':staffId/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Téléverser la photo de profil / avatar du membre du staff vers Cloudinary',
    description: 'Envoie l\'image avatar via multipart/form-data, la stocke sur Cloudinary et met à jour le profil du coiffeur.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image avatar',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Photo de profil téléversée et membre du staff mis à jour.',
    type: StaffResponseDto,
  })
  public async uploadAvatar(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StaffResponseDto> {
    return this.uploadStaffAvatarUseCase.execute(salonId, staffId, file);
  }

  @Delete(':staffId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un membre de l’équipe',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'staffId', example: 'staff-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membre retiré du salon avec succès.',
  })
  public async delete(
    @Param('salonId') salonId: string,
    @Param('staffId') staffId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteStaffUseCase.execute(salonId, staffId);
  }
}
