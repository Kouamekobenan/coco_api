import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(session: SessionEntity): Promise<void> {
    await this.prisma.session.create({
      data: {
        id: session.getId(),
        userId: session.getUserId(),
        refreshToken: session.getRefreshToken(),
        deviceId: session.getDeviceId() ?? undefined,
        ipAddress: session.getIpAddress() ?? undefined,
        userAgent: session.getUserAgent() ?? undefined,
        expiresAt: session.getExpiresAt(),
        revokedAt: session.getRevokedAt() ?? undefined,
      },
    });
  }

  public async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const raw = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!raw) return null;

    return SessionEntity.reconstitute({
      id: raw.id,
      userId: raw.userId,
      refreshToken: raw.refreshToken,
      deviceId: raw.deviceId,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      revokedAt: raw.revokedAt,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public async findById(id: string): Promise<SessionEntity | null> {
    const raw = await this.prisma.session.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return SessionEntity.reconstitute({
      id: raw.id,
      userId: raw.userId,
      refreshToken: raw.refreshToken,
      deviceId: raw.deviceId,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      revokedAt: raw.revokedAt,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public async revokeByRefreshToken(refreshToken: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!session || session.revokedAt !== null) {
      return false;
    }

    await this.prisma.session.update({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    });
    return true;
  }

  public async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return result.count;
  }

  public async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
    const raws = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return raws.map((raw) =>
      SessionEntity.reconstitute({
        id: raw.id,
        userId: raw.userId,
        refreshToken: raw.refreshToken,
        deviceId: raw.deviceId,
        ipAddress: raw.ipAddress,
        userAgent: raw.userAgent,
        revokedAt: raw.revokedAt,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    );
  }

  public async update(session: SessionEntity): Promise<void> {
    await this.prisma.session.update({
      where: { id: session.getId() },
      data: {
        refreshToken: session.getRefreshToken(),
        expiresAt: session.getExpiresAt(),
        revokedAt: session.getRevokedAt() ?? undefined,
        updatedAt: session.getUpdatedAt(),
      },
    });
  }
}
