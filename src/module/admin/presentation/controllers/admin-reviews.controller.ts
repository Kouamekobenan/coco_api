import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../infrastructure/security/super-admin.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { AdminReviewsUseCase } from '../../application/usecases/admin-reviews.usecase.js';
import {
  AdminModerateReviewDto,
  AdminReviewsQueryDto,
} from '../../application/dtos/admin.dto.js';
import { IAdminReviewsRoutes } from '../../domain/interfaces/admin-routes.interface.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'admin/reviews', version: '1' })
export class AdminReviewsController implements IAdminReviewsRoutes {
  constructor(private readonly reviewsUseCase: AdminReviewsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Lister et auditer tous les avis clients laissés sur la plateforme',
  })
  @ApiResponse({ status: 200, description: 'Liste paginée des avis.' })
  public async getReviews(@Query() query: AdminReviewsQueryDto) {
    return this.reviewsUseCase.getReviews(query);
  }

  @Patch(':id/moderate')
  @ApiOperation({
    summary: 'Modérer un avis (masquer, rétablir ou renseigner un motif de modération)',
  })
  @ApiResponse({ status: 200, description: 'Avis modéré avec succès.' })
  public async moderateReview(
    @Param('id') id: string,
    @Body() dto: AdminModerateReviewDto,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.reviewsUseCase.moderateReview(id, dto, adminUser.sub);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer définitivement un avis abusif ou diffamatoire',
  })
  @ApiResponse({ status: 200, description: 'Avis supprimé.' })
  public async deleteReview(
    @Param('id') id: string,
    @CurrentUser() adminUser: TokenPayload,
  ) {
    return this.reviewsUseCase.deleteReview(id, adminUser.sub);
  }
}
