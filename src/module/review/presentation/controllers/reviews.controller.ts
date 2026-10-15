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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/security/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/infrastructure/security/current-user.decorator.js';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import { CreateReviewDto } from '../../application/dtos/create-review.dto.js';
import { ReviewUseCase } from '../../application/usecases/review.usecase.js';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1' })
export class ReviewsController {
  constructor(private readonly reviewUseCase: ReviewUseCase) {}

  @Post('salons/:salonId/bookings/:bookingId/review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Le client note un salon',
    description:
      "Réservé au client de la réservation, une fois celle-ci COMPLETED. Un seul avis par réservation.",
  })
  @ApiResponse({ status: 201, description: 'Avis enregistré.' })
  public async reviewSalon(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.reviewUseCase.reviewSalon(user.sub, salonId, bookingId, dto);
  }

  @Post('salons/:salonId/bookings/:bookingId/client-review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Le propriétaire du salon note un client',
    description:
      "Réservé au propriétaire (SALON_OWNER) du salon, une fois la réservation COMPLETED. Un seul avis par réservation.",
  })
  @ApiResponse({ status: 201, description: 'Avis sur le client enregistré.' })
  public async reviewClient(
    @Param('salonId') salonId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.reviewUseCase.reviewClient(user.sub, salonId, bookingId, dto);
  }

  @Get('clients/:clientId/reviews')
  @ApiOperation({
    summary: "Consulter les avis laissés par les salons sur un client",
    description: "Visible par tous les membres de salons : moyenne, total et liste des avis.",
  })
  @ApiResponse({ status: 200, description: 'Avis et moyenne du client.' })
  public async getClientReviews(
    @Param('clientId') clientId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.reviewUseCase.getClientReviews(user.sub, clientId);
  }
}
