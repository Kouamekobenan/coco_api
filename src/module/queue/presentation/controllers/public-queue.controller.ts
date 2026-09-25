import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicTicketStatusResponseDto } from '../../application/dtos/public-ticket-status-response.dto.js';
import { GetTicketUseCase } from '../../application/usecases/get-ticket.usecase.js';

@ApiTags('Public Queue — Suivi Ticket Client (Web & QR Code)')
@Controller({ path: 'public/queue', version: '1' })
export class PublicQueueController {
  constructor(private readonly getTicketUseCase: GetTicketUseCase) {}

  @Get('track/:qrCodeToken')
  @ApiOperation({
    summary: 'Suivi live du ticket par le client (sans authentification)',
    description:
      'Accessible par scan du QR Code ou lien SMS. Indique la position dans la file (ex: 3ème), le nombre de personnes devant, le temps restant et le statut.',
  })
  @ApiResponse({ status: 200, type: PublicTicketStatusResponseDto })
  public async trackTicket(
    @Param('qrCodeToken') qrCodeToken: string,
  ): Promise<PublicTicketStatusResponseDto> {
    return await this.getTicketUseCase.getByQrCodeToken(qrCodeToken);
  }
}
