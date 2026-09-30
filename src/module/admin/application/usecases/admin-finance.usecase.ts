import { Inject, Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import { AdminCreatePayoutDto, AdminFinanceQueryDto } from '../dtos/admin.dto.js';

@Injectable()
export class AdminFinanceUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  public async getLedger(query: AdminFinanceQueryDto) {
    return this.adminRepository.getLedger({
      page: query.page,
      limit: query.limit,
      salonId: query.salonId,
      entryType: query.entryType,
    });
  }

  public async getSalonBalance(salonId: string) {
    return this.adminRepository.getSalonLedgerBalance(salonId);
  }

  public async createPayout(dto: AdminCreatePayoutDto, actorId: string) {
    const payout = await this.adminRepository.createPayout(dto);

    await this.adminRepository.logAudit({
      actorId,
      salonId: dto.salonId,
      action: 'FINANCE_PAYOUT_CREATED',
      entityType: 'LedgerEntry',
      entityId: payout.id,
      afterData: {
        amount: dto.amount,
        reference: dto.reference,
        description: dto.description,
      },
    });

    return payout;
  }
}
