import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { RedeemLoyaltyPointsDto } from '../../application/dtos/redeem-loyalty.dto.js';
import { LoyaltyAccountResponseDto } from '../../application/dtos/payment-response.dto.js';
import { LoyaltyUseCase } from '../../application/usecases/loyalty.usecase.js';

@ApiTags('Loyalty — Points de Fidélité & Réductions')
@Controller({ path: 'salons/:salonId/loyalty', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyUseCase: LoyaltyUseCase) {}

  @Get('customers/:customerId')
  @ApiOperation({ summary: 'Consulter le solde de points et l\'historique d\'un client' })
  @ApiResponse({ status: 200, type: LoyaltyAccountResponseDto })
  public async getCustomerLoyalty(
    @Param('salonId') salonId: string,
    @Param('customerId') customerId: string,
  ): Promise<LoyaltyAccountResponseDto> {
    return await this.loyaltyUseCase.getCustomerLoyalty(salonId, customerId);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Utiliser (brûler) des points de fidélité pour une réduction' })
  @ApiResponse({ status: 200, type: LoyaltyAccountResponseDto })
  public async redeem(
    @Param('salonId') salonId: string,
    @Body() dto: RedeemLoyaltyPointsDto,
  ): Promise<LoyaltyAccountResponseDto> {
    return await this.loyaltyUseCase.redeemPoints(salonId, dto);
  }
}
