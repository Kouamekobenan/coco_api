import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SubscribePlanDto } from '../dtos/subscribe-plan.dto.js';
import { SalonBillingStatusResponseDto } from '../dtos/salon-billing-status-response.dto.js';
import { SalonPlanNotFoundException } from '../../domain/exceptions/salon-billing.exception.js';
import { GetSalonBillingStatusUseCase } from './get-salon-billing-status.usecase.js';

@Injectable()
export class SubscribeSalonPlanUseCase {
  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
    private readonly prisma: PrismaService,
    private readonly getStatusUseCase: GetSalonBillingStatusUseCase,
  ) {}

  public async execute(
    salonId: string,
    dto: SubscribePlanDto,
  ): Promise<SalonBillingStatusResponseDto> {
    if (dto.tier === 'FREE') {
      throw new BadRequestException(
        'Le pack gratuit est attribué automatiquement lors de la création du salon.',
      );
    }

    const targetPlan = await this.billingRepo.findPlanByTier(dto.tier);
    if (!targetPlan) {
      throw new SalonPlanNotFoundException(dto.tier);
    }

    let subscription = await this.billingRepo.findSubscriptionBySalonId(salonId);
    if (!subscription) {
      // Si inexistant, initialisation
      subscription = await this.billingRepo.saveSubscription(
        (await this.getStatusUseCase.execute(salonId)) as any,
      );
      subscription = await this.billingRepo.findSubscriptionBySalonId(salonId);
    }

    if (!subscription) {
      throw new BadRequestException('Impossible de trouver l\'abonnement du salon.');
    }

    const period = dto.period ?? 'MONTHLY';
    const amount =
      period === 'YEARLY' && targetPlan.getPriceYear()
        ? targetPlan.getPriceYear()!
        : targetPlan.getPriceMonth();

    const additionalDays = period === 'YEARLY' ? 365 : 30;

    // Mise à jour de l'abonnement
    subscription.upgradeOrRenew(targetPlan.getId(), additionalDays);
    await this.billingRepo.updateSubscription(subscription);

    // Enregistrement de la transaction de paiement (Mobile Money / Wave)
    const txId = `MM-SUB-${randomUUID().substring(0, 8).toUpperCase()}`;
    await this.billingRepo.recordPayment({
      subscriptionId: subscription.getId(),
      salonId,
      amount,
      currency: 'XOF',
      provider: dto.provider,
      status: 'SUCCEEDED',
      providerTxId: txId,
      billingPeriod: period,
      paidAt: new Date(),
    });

    // Si le salon était suspendu pour cause d'expiration, on le réactive
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (salon && salon.status === 'SUSPENDED') {
      await this.prisma.salon.update({
        where: { id: salonId },
        data: { status: 'ACTIVE' },
      });
    }

    return this.getStatusUseCase.execute(salonId);
  }
}
