import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { SubscriptionQueryDto } from '../../application/dtos/subscription-query.dto.js';
import { PaginatedSubscriptionsResponseDto } from '../../application/dtos/salon-subscription-response.dto.js';
import { GetUserSubscriptionsUseCase } from '../../application/usecases/get-user-subscriptions.usecase.js';

@ApiTags('Utilisateurs — Mes Abonnements')
@Controller({ path: 'users/me/subscriptions', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UserSubscriptionsController {
  constructor(
    private readonly getUserSubscriptionsUseCase: GetUserSubscriptionsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister mes abonnements salons',
    description:
      'Retourne la liste paginée de tous les salons suivis par l’utilisateur connecté, avec les informations vitrine du salon.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedSubscriptionsResponseDto,
  })
  public async getMySubscriptions(
    @CurrentUser() user: TokenPayload,
    @Query() query: SubscriptionQueryDto,
  ): Promise<PaginatedSubscriptionsResponseDto> {
    return this.getUserSubscriptionsUseCase.execute(user.sub, query);
  }
}
