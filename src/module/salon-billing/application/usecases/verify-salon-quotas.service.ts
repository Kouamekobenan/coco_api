import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';
import {
  PlanQuotaExceededException,
  SalonSubscriptionExpiredException,
} from '../../domain/exceptions/salon-billing.exception.js';

@Injectable()
export class VerifySalonQuotasService {
  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
    private readonly prisma: PrismaService,
  ) {}

  public async assertCanAddStaff(salonId: string): Promise<void> {
    const subscription = await this.billingRepo.findSubscriptionBySalonId(salonId);
    if (!subscription || subscription.isExpired()) {
      throw new SalonSubscriptionExpiredException(salonId);
    }

    const plan = subscription.getPlan();
    if (!plan) return;

    const maxStaff = plan.getMaxStaff();
    if (maxStaff !== null && maxStaff !== undefined) {
      const currentStaffCount = await this.prisma.staff.count({
        where: { salonId, isActive: true },
      });

      if (currentStaffCount >= maxStaff) {
        throw new PlanQuotaExceededException('STAFF', currentStaffCount, maxStaff);
      }
    }
  }

  public async assertCanAddService(salonId: string): Promise<void> {
    const subscription = await this.billingRepo.findSubscriptionBySalonId(salonId);
    if (!subscription || subscription.isExpired()) {
      throw new SalonSubscriptionExpiredException(salonId);
    }

    const plan = subscription.getPlan();
    if (!plan) return;

    const maxServices = plan.getMaxServices();
    if (maxServices !== null && maxServices !== undefined) {
      const currentServicesCount = await this.prisma.service.count({
        where: { salonId, isActive: true },
      });

      if (currentServicesCount >= maxServices) {
        throw new PlanQuotaExceededException('SERVICE', currentServicesCount, maxServices);
      }
    }
  }
}
