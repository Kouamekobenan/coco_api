import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { ReferralUseCase } from '../../application/usecases/referral.usecase.js';

@ApiTags('Referrals (Parrainage)')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'referrals', version: '1' })
export class ReferralController {
  constructor(private readonly referralUseCase: ReferralUseCase) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mon code de parrainage et mes filleuls',
    description:
      'Retourne le code personnel à partager, les points offerts par parrainage et la liste des filleuls inscrits avec ce code.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informations de parrainage.' })
  public async getMine(@CurrentUser() user: TokenPayload) {
    return this.referralUseCase.getMyReferralInfo(user.sub);
  }
}
