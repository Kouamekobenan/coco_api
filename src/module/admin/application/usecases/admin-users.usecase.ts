import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import { AdminUpdateUserRoleDto, AdminUsersQueryDto } from '../dtos/admin.dto.js';

@Injectable()
export class AdminUsersUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getUsers(query: AdminUsersQueryDto) {
    return this.adminRepository.getUsers({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isSuperAdmin: query.isSuperAdmin,
      isActive: query.isActive,
    });
  }

  public async getUserById(id: string) {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID "${id}" introuvable.`);
    }
    return user;
  }

  public async toggleUserStatus(id: string, actorId: string) {
    const user = await this.getUserById(id);
    const updated = await this.adminRepository.toggleUserStatus(id);

    await this.adminRepository.logAudit({
      actorId,
      action: updated.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'User',
      entityId: id,
      beforeData: { isActive: user.isActive },
      afterData: { isActive: updated.isActive },
    });

    return updated;
  }

  public async updateUserRole(
    id: string,
    dto: AdminUpdateUserRoleDto,
    actorId: string,
  ) {
    const user = await this.getUserById(id);
    const updated = await this.adminRepository.updateUserSuperAdmin(
      id,
      dto.isSuperAdmin,
    );

    await this.adminRepository.logAudit({
      actorId,
      action: dto.isSuperAdmin
        ? 'USER_SUPERADMIN_GRANTED'
        : 'USER_SUPERADMIN_REVOKED',
      entityType: 'User',
      entityId: id,
      beforeData: { isSuperAdmin: user.isSuperAdmin },
      afterData: { isSuperAdmin: dto.isSuperAdmin },
      justification: dto.justification,
    });

    return updated;
  }

  public async revokeUserSessions(id: string, actorId: string) {
    await this.getUserById(id);
    const revokedCount = await this.adminRepository.revokeUserSessions(id);

    await this.adminRepository.logAudit({
      actorId,
      action: 'USER_SESSIONS_REVOKED',
      entityType: 'User',
      entityId: id,
      afterData: { revokedCount },
    });

    return { message: `${revokedCount} session(s) révoquée(s) avec succès.` };
  }
}
