import { Inject, Injectable } from '@nestjs/common';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';
import { SessionResponseDto } from '../dtos/session-response.dto.js';

@Injectable()
export class GetActiveSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  public async execute(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.findActiveByUserId(userId);
    return sessions.map((session) => ({
      id: session.getId(),
      ipAddress: session.getIpAddress(),
      userAgent: session.getUserAgent(),
      deviceId: session.getDeviceId(),
      expiresAt: session.getExpiresAt(),
      createdAt: session.getCreatedAt(),
    }));
  }
}
