import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { ISalonBillingRepository } from '../../domain/repositories/salon-billing.repository.interface.js';
import { SALON_BILLING_REPOSITORY } from '../../domain/repositories/salon-billing.repository.interface.js';

@Injectable()
export class CheckExpiringSubscriptionsUseCase {
  private readonly logger = new Logger(CheckExpiringSubscriptionsUseCase.name);

  constructor(
    @Inject(SALON_BILLING_REPOSITORY)
    private readonly billingRepo: ISalonBillingRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Exécution automatique chaque jour à minuit
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async handleCron(): Promise<{ expiredCount: number }> {
    this.logger.log('Vérification quotidienne des abonnements expirés en cours...');
    const now = new Date();

    const expiredSubs = await this.billingRepo.findExpiredActiveSubscriptions(now);
    let expiredCount = 0;

    for (const sub of expiredSubs) {
      sub.markExpired();
      await this.billingRepo.updateSubscription(sub);

      // Suspension du salon car son abonnement (ou période d'essai 1 mois) a expiré
      await this.prisma.salon.update({
        where: { id: sub.getSalonId() },
        data: { status: 'SUSPENDED' },
      });

      this.logger.warn(
        `Abonnement du salon ${sub.getSalonId()} expiré. Le salon a été suspendu automatiquement.`,
      );
      expiredCount++;
    }

    this.logger.log(`Vérification terminée. ${expiredCount} abonnements ont expiré.`);
    return { expiredCount };
  }
}
