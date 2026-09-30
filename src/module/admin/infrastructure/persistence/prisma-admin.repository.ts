import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  AdminDashboardKpis,
  AdminPaymentStat,
  AuditLogEntry,
  IAdminRepository,
} from '../../domain/repositories/admin.repository.interface.js';

@Injectable()
export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getDashboardKpis(): Promise<AdminDashboardKpis> {
    const [
      totalSalons,
      activeSalons,
      pendingSalons,
      suspendedSalons,
      cocomoussoSalons,
      cocotailleSalons,
      totalUsers,
      totalBookings,
      completedBookings,
      totalReviews,
      totalRevenueGmvAggregate,
      commissionsAggregate,
    ] = await Promise.all([
      this.prisma.salon.count(),
      this.prisma.salon.count({ where: { status: 'ACTIVE' } }),
      this.prisma.salon.count({ where: { status: 'PENDING_REVIEW' } }),
      this.prisma.salon.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.salon.count({ where: { universe: 'COCOMOUSSO' } }),
      this.prisma.salon.count({ where: { universe: 'COCOTAILLE' } }),
      this.prisma.user.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.review.count(),
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      this.prisma.accountingLedger.aggregate({
        where: { entryType: 'COMMISSION_DEBIT' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalSalons,
      activeSalons,
      pendingSalons,
      suspendedSalons,
      cocomoussoSalons,
      cocotailleSalons,
      totalUsers,
      totalBookings,
      completedBookings,
      totalRevenueGmv: Number(totalRevenueGmvAggregate._sum.totalPrice ?? 0),
      totalCommissions: Math.abs(Number(commissionsAggregate._sum.amount ?? 0)),
      totalReviews,
    };
  }

  public async getPaymentStats(): Promise<AdminPaymentStat[]> {
    const stats = await this.prisma.payment.groupBy({
      by: ['provider'],
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
      _count: { id: true },
    });

    return stats.map((s) => ({
      provider: s.provider,
      totalAmount: Number(s._sum.amount ?? 0),
      transactionCount: s._count.id,
    }));
  }

  public async getSalons(query: {
    page: number;
    limit: number;
    status?: string;
    universe?: string;
    search?: string;
  }): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.universe) {
      where.universe = query.universe;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { commune: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.salon.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            where: { role: 'SALON_OWNER' },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              members: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.salon.count({ where }),
    ]);

    return { items, total };
  }

  public async getSalonById(id: string): Promise<any | null> {
    return this.prisma.salon.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            members: true,
            services: true,
          },
        },
      },
    });
  }

  public async updateSalonStatus(id: string, status: string): Promise<any> {
    return this.prisma.salon.update({
      where: { id },
      data: { status: status as any },
    });
  }

  public async reassignSalonOwner(salonId: string, newOwnerId: string): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // Retirer le statut SALON_OWNER des propriétaires actuels
      await tx.salonMember.updateMany({
        where: { salonId, role: 'SALON_OWNER' },
        data: { role: 'SALON_MANAGER' },
      });

      // Assigner le nouveau propriétaire
      const existingMember = await tx.salonMember.findUnique({
        where: {
          userId_salonId: {
            userId: newOwnerId,
            salonId,
          },
        },
      });

      if (existingMember) {
        return tx.salonMember.update({
          where: { id: existingMember.id },
          data: { role: 'SALON_OWNER' },
        });
      } else {
        return tx.salonMember.create({
          data: {
            salonId,
            userId: newOwnerId,
            role: 'SALON_OWNER',
          },
        });
      }
    });
  }

  public async getUsers(query: {
    page: number;
    limit: number;
    search?: string;
    isSuperAdmin?: boolean;
    isActive?: boolean;
  }): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where: any = {};

    if (query.isSuperAdmin !== undefined) {
      where.isSuperAdmin = query.isSuperAdmin;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          avatarUrl: true,
          defaultUniverse: true,
          isPhoneVerified: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          memberships: {
            select: {
              role: true,
              salon: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              memberships: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  public async getUserById(id: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        avatarUrl: true,
        defaultUniverse: true,
        isPhoneVerified: true,
        isActive: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
        },
        devices: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            loyaltyAccounts: true,
          },
        },
      },
    });
  }

  public async toggleUserStatus(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        phone: true,
        isActive: true,
        isSuperAdmin: true,
      },
    });
  }

  public async updateUserSuperAdmin(userId: string, isSuperAdmin: boolean): Promise<any> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin },
      select: {
        id: true,
        phone: true,
        isActive: true,
        isSuperAdmin: true,
      },
    });
  }

  public async revokeUserSessions(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  public async getReviews(query: {
    page: number;
    limit: number;
    salonId?: string;
    isPublic?: boolean;
    rating?: number;
  }): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where: any = {};

    if (query.salonId) {
      where.salonId = query.salonId;
    }
    if (query.isPublic !== undefined) {
      where.isPublic = query.isPublic;
    }
    if (query.rating) {
      where.rating = query.rating;
    }

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
            },
          },
          salon: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total };
  }

  public async moderateReview(
    reviewId: string,
    isPublic: boolean,
    moderationReason?: string,
  ): Promise<any> {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isPublic,
        moderationReason: moderationReason ?? null,
      },
    });
  }

  public async deleteReview(reviewId: string): Promise<boolean> {
    await this.prisma.review.delete({
      where: { id: reviewId },
    });
    return true;
  }

  public async getLedger(query: {
    page: number;
    limit: number;
    salonId?: string;
    entryType?: string;
  }): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where: any = {};

    if (query.salonId) {
      where.salonId = query.salonId;
    }
    if (query.entryType) {
      where.entryType = query.entryType as any;
    }

    const [items, total] = await Promise.all([
      this.prisma.accountingLedger.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          salon: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.accountingLedger.count({ where }),
    ]);

    return { items, total };
  }

  public async getSalonLedgerBalance(salonId: string): Promise<{ balance: number; currency: string }> {
    const lastEntry = await this.prisma.accountingLedger.findFirst({
      where: { salonId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      balance: lastEntry ? Number(lastEntry.balanceAfter) : 0,
      currency: 'XOF',
    };
  }

  public async createPayout(data: {
    salonId: string;
    amount: number;
    reference: string;
    description?: string;
  }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const lastEntry = await tx.accountingLedger.findFirst({
        where: { salonId: data.salonId },
        orderBy: { createdAt: 'desc' },
      });

      const currentBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newBalance = currentBalance - data.amount;

      return tx.accountingLedger.create({
        data: {
          salon: { connect: { id: data.salonId } },
          amount: new Prisma.Decimal(-data.amount),
          balanceAfter: new Prisma.Decimal(newBalance),
          entryType: 'PAYOUT',
          description: data.description ?? `Reversement virement Super-Admin: ${data.reference}`,
        },
      });
    });
  }

  public async getSettings(): Promise<any[]> {
    return this.prisma.platformSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  public async getSettingByKey(key: string): Promise<any | null> {
    return this.prisma.platformSetting.findUnique({
      where: { key },
    });
  }

  public async upsertSetting(key: string, value: any, description?: string): Promise<any> {
    return this.prisma.platformSetting.upsert({
      where: { key },
      create: {
        key,
        value,
        description,
      },
      update: {
        value,
        description: description ?? undefined,
      },
    });
  }

  public async logAudit(entry: AuditLogEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        salonId: entry.salonId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        beforeData: entry.beforeData ?? undefined,
        afterData: entry.afterData ?? undefined,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        justification: entry.justification ?? null,
      },
    });
  }

  public async getAuditLogs(query: {
    page: number;
    limit: number;
    actorId?: string;
    salonId?: string;
    entityType?: string;
  }): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where: any = {};

    if (query.actorId) {
      where.actorId = query.actorId;
    }
    if (query.salonId) {
      where.salonId = query.salonId;
    }
    if (query.entityType) {
      where.entityType = query.entityType;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}
