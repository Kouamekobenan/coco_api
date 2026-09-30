import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PublicTicketStatusResponseDto } from '../../application/dtos/public-ticket-status-response.dto.js';
import { GetTicketUseCase } from '../../application/usecases/get-ticket.usecase.js';
import { GenerateTicketPdfUseCase } from '../../application/usecases/generate-ticket-pdf.usecase.js';

@ApiTags('Queue')
@Controller({ path: 'public/queue', version: '1' })
export class PublicQueueController {
  constructor(
    private readonly getTicketUseCase: GetTicketUseCase,
    private readonly generateTicketPdfUseCase: GenerateTicketPdfUseCase,
  ) {}

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

  @Get('tickets/:ticketId/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="ticket.pdf"')
  @ApiOperation({
    summary: 'Télécharger / Imprimer le ticket au format PDF',
    description: 'Génère un reçu au format ticket physique thermique avec QR Code.',
  })
  @ApiResponse({ status: 200, description: 'Flux binaire du document PDF.' })
  public async downloadTicketPdf(
    @Param('ticketId') ticketId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.generateTicketPdfUseCase.execute(ticketId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="ticket.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
