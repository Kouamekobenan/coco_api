import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import {
  AdminReassignOwnerDto,
  AdminSalonsQueryDto,
  AdminUpdateSalonStatusDto,
} from '../dtos/admin.dto.js';

@Injectable()
export class AdminSalonsUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getSalons(query: AdminSalonsQueryDto) {
    return this.adminRepository.getSalons({
      page: query.page,
      limit: query.limit,
      status: query.status,
      universe: query.universe,
      search: query.search,
    });
  }

  public async getSalonById(id: string) {
    const salon = await this.adminRepository.getSalonById(id);
    if (!salon) {
      throw new NotFoundException(`Salon avec l'ID "${id}" introuvable.`);
    }
    return salon;
  }

  public async updateSalonStatus(
    id: string,
    dto: AdminUpdateSalonStatusDto,
    actorId: string,
  ) {
    const salon = await this.getSalonById(id);
    const updated = await this.adminRepository.updateSalonStatus(id, dto.status);

    await this.adminRepository.logAudit({
      actorId,
      salonId: id,
      action: `SALON_STATUS_${dto.status}`,
      entityType: 'Salon',
      entityId: id,
      beforeData: { status: salon.status },
      afterData: { status: dto.status },
      justification: dto.justification,
    });

    return updated;
  }

  public async reassignSalonOwner(
    salonId: string,
    dto: AdminReassignOwnerDto,
    actorId: string,
  ) {
    await this.getSalonById(salonId);
    const updated = await this.adminRepository.reassignSalonOwner(
      salonId,
      dto.newOwnerId,
    );

    await this.adminRepository.logAudit({
      actorId,
      salonId,
      action: 'SALON_OWNER_REASSIGNED',
      entityType: 'Salon',
      entityId: salonId,
      afterData: { newOwnerId: dto.newOwnerId },
      justification: dto.justification,
    });

    return updated;
  }
}
