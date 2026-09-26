import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { InitiatePaymentDto } from '../../application/dtos/initiate-payment.dto.js';
import { PaymentQueryDto } from '../../application/dtos/payment-query.dto.js';
import { RefundPaymentDto } from '../../application/dtos/refund-payment.dto.js';
import {
  PaymentListResponseDto,
  PaymentResponseDto,
} from '../../application/dtos/payment-response.dto.js';
import { PaymentDtoMapper } from '../../application/dtos/payment-dto.mapper.js';
import { InitiatePaymentUseCase } from '../../application/usecases/initiate-payment.usecase.js';
import { GetPaymentByIdUseCase } from '../../application/usecases/get-payment-by-id.usecase.js';
import { SearchPaymentsUseCase } from '../../application/usecases/search-payments.usecase.js';
import { RefundPaymentUseCase } from '../../application/usecases/refund-payment.usecase.js';

@ApiTags('Payments — Paiements & Acomptes Mobile Money / Cash')
@Controller({ path: 'salons/:salonId/payments', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(
    private readonly initiatePaymentUseCase: InitiatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly searchPaymentsUseCase: SearchPaymentsUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
  ) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initier un paiement d\'acompte ou de solde (Wave, Orange, MTN, Moov ou Espèces)',
    description:
      'Génère une URL de redirection deep-link pour les wallets Mobile Money ou encaisse directement les paiements en espèces avec confirmation immédiate du rendez-vous.',
  })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  public async initiate(
    @Param('salonId') salonId: string,
    @Body() dto: InitiatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const { payment, checkoutUrl } = await this.initiatePaymentUseCase.execute(salonId, dto);
    return PaymentDtoMapper.toPaymentResponse(payment, checkoutUrl);
  }

  @Get()
  @ApiOperation({ summary: 'Lister et filtrer les paiements du salon' })
  @ApiResponse({ status: 200, type: PaymentListResponseDto })
  public async search(
    @Param('salonId') salonId: string,
    @Query() query: PaymentQueryDto,
  ): Promise<PaymentListResponseDto> {
    return await this.searchPaymentsUseCase.execute(salonId, query);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Consulter le détail d\'un paiement' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  public async getById(
    @Param('salonId') salonId: string,
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.getPaymentByIdUseCase.execute(salonId, paymentId);
    return PaymentDtoMapper.toPaymentResponse(payment);
  }

  @Post(':paymentId/refund')
  @ApiOperation({ summary: 'Effectuer un remboursement (total ou partiel) avec audit au grand livre' })
  @ApiResponse({ status: 200 })
  public async refund(
    @Param('salonId') salonId: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: RefundPaymentDto,
  ): Promise<{ status: string; refundedAmount: number }> {
    const refund = await this.refundPaymentUseCase.execute(salonId, paymentId, dto);
    return {
      status: refund.status,
      refundedAmount: refund.amount,
    };
  }
}
