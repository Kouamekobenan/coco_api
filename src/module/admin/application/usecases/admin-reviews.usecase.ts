import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import { AdminModerateReviewDto, AdminReviewsQueryDto } from '../dtos/admin.dto.js';

@Injectable()
export class AdminReviewsUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getReviews(query: AdminReviewsQueryDto) {
    return this.adminRepository.getReviews({
      page: query.page,
      limit: query.limit,
      salonId: query.salonId,
      isPublic: query.isPublic,
      rating: query.rating,
    });
  }

  public async moderateReview(
    id: string,
    dto: AdminModerateReviewDto,
    actorId: string,
  ) {
    const updated = await this.adminRepository.moderateReview(
      id,
      dto.isPublic,
      dto.moderationReason,
    );

    await this.adminRepository.logAudit({
      actorId,
      salonId: updated.salonId,
      action: dto.isPublic ? 'REVIEW_PUBLISHED' : 'REVIEW_HIDDEN',
      entityType: 'Review',
      entityId: id,
      afterData: {
        isPublic: dto.isPublic,
        moderationReason: dto.moderationReason,
      },
    });

    return updated;
  }

  public async deleteReview(id: string, actorId: string) {
    await this.adminRepository.deleteReview(id);

    await this.adminRepository.logAudit({
      actorId,
      action: 'REVIEW_DELETED',
      entityType: 'Review',
      entityId: id,
    });

    return { message: 'Avis supprimé définitivement par le Super-Admin.' };
  }
}
