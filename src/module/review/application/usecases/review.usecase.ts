import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, SalonRole } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { CreateReviewDto } from '../dtos/create-review.dto.js';

@Injectable()
export class ReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /** Client -> Salon : le client note le salon après une réservation terminée. */
  public async reviewSalon(
    userId: string,
    salonId: string,
    bookingId: string,
    dto: CreateReviewDto,
  ) {
    const booking = await this.getCompletedBooking(salonId, bookingId);

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        "Seul le client ayant effectué cette réservation peut noter le salon.",
      );
    }

    const existing = await this.prisma.review.findUnique({ where: { bookingId } });
    if (existing) {
      throw new ConflictException('Vous avez déjà noté ce salon pour cette réservation.');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          salonId,
          bookingId,
          userId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      const stats = await tx.review.aggregate({
        where: { salonId, isPublic: true },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.salon.update({
        where: { id: salonId },
        data: {
          averageRating: stats._avg.rating ?? 0,
          reviewCount: stats._count._all,
        },
      });

      return review;
    });
  }

  /** Propriétaire -> Client : le propriétaire du salon note le client. */
  public async reviewClient(
    ownerId: string,
    salonId: string,
    bookingId: string,
    dto: CreateReviewDto,
  ) {
    await this.assertSalonOwner(ownerId, salonId);

    const booking = await this.getCompletedBooking(salonId, bookingId);
    if (!booking.userId) {
      throw new BadRequestException(
        "Ce client n'a pas de compte utilisateur : il ne peut pas être noté.",
      );
    }

    const existing = await this.prisma.clientReview.findUnique({ where: { bookingId } });
    if (existing) {
      throw new ConflictException('Ce client a déjà été noté pour cette réservation.');
    }

    return this.prisma.clientReview.create({
      data: {
        bookingId,
        salonId,
        authorId: ownerId,
        clientId: booking.userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  /** Avis laissés sur un client : visible par tous les propriétaires/membres de salons. */
  public async getClientReviews(requesterId: string, clientId: string) {
    const membership = await this.prisma.salonMember.findFirst({
      where: { userId: requesterId, isActive: true },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException(
        "Seuls les membres d'un salon peuvent consulter les avis sur un client.",
      );
    }

    const [reviews, stats] = await Promise.all([
      this.prisma.clientReview.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          salon: { select: { id: true, name: true } },
        },
      }),
      this.prisma.clientReview.aggregate({
        where: { clientId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return {
      clientId,
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count._all,
      reviews,
    };
  }

  private async getCompletedBooking(salonId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, salonId: true, userId: true, status: true },
    });
    if (!booking || booking.salonId !== salonId) {
      throw new NotFoundException(`Réservation "${bookingId}" introuvable.`);
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Une note ne peut être laissée que sur une réservation terminée (COMPLETED).',
      );
    }
    return booking;
  }

  private async assertSalonOwner(userId: string, salonId: string): Promise<void> {
    const member = await this.prisma.salonMember.findUnique({
      where: { userId_salonId: { userId, salonId } },
      select: { role: true, isActive: true },
    });
    if (!member || !member.isActive || member.role !== SalonRole.SALON_OWNER) {
      throw new ForbiddenException(
        'Seul le propriétaire du salon peut noter un client.',
      );
    }
  }
}
