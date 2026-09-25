import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SalonLedgerResponseDto } from '../../application/dtos/payment-response.dto.js';
import { GetSalonLedgerUseCase } from '../../application/usecases/get-salon-ledger.usecase.js';

@ApiTags('Accounting Ledger — Grand Livre & Séquestre Salon')
@Controller({ path: 'salons/:salonId/ledger', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LedgerController {
  constructor(private readonly getLedgerUseCase: GetSalonLedgerUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Consulter le grand livre comptable et le solde séquestre du salon',
    description:
      'Historique immuable de tous les crédits d\'acomptes, débits de commissions, virements (payouts) et remboursements avec solde après chaque mouvement.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, type: SalonLedgerResponseDto })
  public async getLedger(
    @Param('salonId') salonId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<SalonLedgerResponseDto> {
    return await this.getLedgerUseCase.execute(salonId, Number(page), Number(limit));
  }
}
