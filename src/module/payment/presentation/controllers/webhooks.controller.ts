import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { WebhookPayloadDto } from '../../application/dtos/webhook-payload.dto.js';
import { ProcessPaymentWebhookUseCase } from '../../application/usecases/process-payment-webhook.usecase.js';

@ApiTags('Webhooks — Callbacks Opérateurs Mobile Money')
@Controller({ path: 'webhooks/payments', version: '1' })
export class WebhooksController {
  constructor(private readonly processWebhookUseCase: ProcessPaymentWebhookUseCase) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recevoir les notifications IPN / Webhooks des opérateurs Mobile Money',
    description:
      'Endpoint public appelé par Wave, Orange Money, MTN MoMo ou Moov Money lors du succès ou de l\'échec d\'une transaction. Déclenche automatiquement l\'enregistrement comptable et la confirmation du rendez-vous.',
  })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  public async handleWebhook(
    @Param('provider') providerStr: string,
    @Body() payload: WebhookPayloadDto,
  ): Promise<{ received: boolean }> {
    const provider = providerStr.toUpperCase() as PaymentProvider;
    await this.processWebhookUseCase.execute(provider, payload, payload);
    return { received: true };
  }
}
