import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import { AdminUpsertSettingDto } from '../dtos/admin.dto.js';

@Injectable()
export class AdminSettingsUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getSettings() {
    return this.adminRepository.getSettings();
  }

  public async getSettingByKey(key: string) {
    const setting = await this.adminRepository.getSettingByKey(key);
    if (!setting) {
      throw new NotFoundException(`Paramètre "${key}" introuvable.`);
    }
    return setting;
  }

  public async upsertSetting(
    key: string,
    dto: AdminUpsertSettingDto,
    actorId: string,
  ) {
    const previous = await this.adminRepository.getSettingByKey(key);
    const updated = await this.adminRepository.upsertSetting(
      key,
      dto.value,
      dto.description,
    );

    await this.adminRepository.logAudit({
      actorId,
      action: 'PLATFORM_SETTING_UPSERTED',
      entityType: 'PlatformSetting',
      entityId: key,
      beforeData: previous ? { value: previous.value } : null,
      afterData: { value: dto.value, description: dto.description },
      justification: dto.justification,
    });

    return updated;
  }
}
