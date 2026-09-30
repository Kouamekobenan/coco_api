import { Inject, Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import { AdminAuditLogsQueryDto } from '../dtos/admin.dto.js';

@Injectable()
export class AdminAuditUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getAuditLogs(query: AdminAuditLogsQueryDto) {
    return this.adminRepository.getAuditLogs({
      page: query.page,
      limit: query.limit,
      actorId: query.actorId,
      salonId: query.salonId,
      entityType: query.entityType,
    });
  }
}
