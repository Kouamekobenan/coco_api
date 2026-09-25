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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCustomerNoteDto,
  CustomerNoteResponseDto,
  UpdateCustomerNoteDto,
} from '../../application/dtos/create-customer-note.dto.js';
import {
  AddCustomerNoteUseCase,
  DeleteCustomerNoteUseCase,
  GetCustomerNotesUseCase,
  UpdateCustomerNoteUseCase,
} from '../../application/usecases/customer-notes.usecase.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';

@ApiTags('CRM — Notes & Fiches Techniques')
@Controller({ path: 'salons/:salonId/customers/:customerId/notes', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CustomerNotesController {
  constructor(
    private readonly addCustomerNoteUseCase: AddCustomerNoteUseCase,
    private readonly getCustomerNotesUseCase: GetCustomerNotesUseCase,
    private readonly updateCustomerNoteUseCase: UpdateCustomerNoteUseCase,
    private readonly deleteCustomerNoteUseCase: DeleteCustomerNoteUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une note ou fiche technique sur le client',
    description: 'Enregistre une observation technique ou confidentielle (sensibilité cuir chevelu, mèches préférées, formule de couleur).',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Note ajoutée.',
    type: CustomerNoteResponseDto,
  })
  public async addNote(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateCustomerNoteDto,
  ): Promise<CustomerNoteResponseDto> {
    return this.addCustomerNoteUseCase.execute(salonId, customerId, user.sub, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter l’historique des fiches techniques du client',
    description: 'Notes privées accessibles uniquement par l\'équipe du salon.',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des notes techniques.',
    type: [CustomerNoteResponseDto],
  })
  public async getNotes(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
  ): Promise<CustomerNoteResponseDto[]> {
    return this.getCustomerNotesUseCase.execute(salonId, customerId);
  }

  @Patch(':noteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier une note technique',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiParam({ name: 'noteId', example: 'note-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note modifiée.',
    type: CustomerNoteResponseDto,
  })
  public async updateNote(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateCustomerNoteDto,
  ): Promise<CustomerNoteResponseDto> {
    return this.updateCustomerNoteUseCase.execute(salonId, customerId, noteId, dto);
  }

  @Delete(':noteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une note technique',
  })
  @ApiParam({ name: 'salonId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'customerId', example: 'customer-uuid' })
  @ApiParam({ name: 'noteId', example: 'note-uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note supprimée.',
  })
  public async deleteNote(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
    @Param('noteId') noteId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.deleteCustomerNoteUseCase.execute(salonId, customerId, noteId);
  }
}
