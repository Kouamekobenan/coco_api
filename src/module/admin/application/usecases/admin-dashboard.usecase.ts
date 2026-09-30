import { Inject, Injectable } from '@nestjs/common';
import type {
  AdminDashboardKpis,
  AdminPaymentStat,
  IAdminRepository,
} from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';

@Injectable()
export class AdminDashboardUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getKpis(): Promise<AdminDashboardKpis> {
    return this.adminRepository.getDashboardKpis();
  }

  public async getPaymentStats(): Promise<AdminPaymentStat[]> {
    return this.adminRepository.getPaymentStats();
  }
}
