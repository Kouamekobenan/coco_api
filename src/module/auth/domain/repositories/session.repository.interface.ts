import { SessionEntity } from '../entities/session.entity.js';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface ISessionRepository {
  save(session: SessionEntity): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<SessionEntity | null>;
  findById(id: string): Promise<SessionEntity | null>;
  revokeByRefreshToken(refreshToken: string): Promise<boolean>;
  revokeAllForUser(userId: string): Promise<number>;
  findActiveByUserId(userId: string): Promise<SessionEntity[]>;
  update(session: SessionEntity): Promise<void>;
}
