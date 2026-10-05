import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository.interface.js';
import { BookingLifecycleUseCase } from '../../application/usecases/booking-lifecycle.usecase.js';

@Injectable()
export class ExpiredHoldsScheduler {
  private readonly logger = new Logger(ExpiredHoldsScheduler.name);
  private isRunning = false;

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    private readonly lifecycleUseCase: BookingLifecycleUseCase,
  ) {}

  /**
   * Tâche périodique (Filet de sécurité) exécutée toutes les 5 minutes.
   * Scanne la base pour détecter et libérer tout créneau dont l'acompte
   * n'a pas été réglé dans le délai de 15 minutes.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  public async handleExpiredHoldsSweep(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('[ExpiredHoldsScheduler] Balayage déjà en cours, passe ignorée.');
      return;
    }

    this.isRunning = true;
    try {
      const now = new Date();
      const expiredList = await this.bookingRepo.findExpiredHolds(now);

      if (expiredList.length === 0) {
        return;
      }

      this.logger.log(
        `[ExpiredHoldsScheduler] Détection de ${expiredList.length} créneau(x) d'acompte expiré(s). Libération en cours...`,
      );

      for (const booking of expiredList) {
        try {
          await this.lifecycleUseCase.expireHold(booking.id);
          this.logger.log(
            `[ExpiredHoldsScheduler] Réservation ${booking.id} (Salon: ${booking.salonId}) libérée avec succès.`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `[ExpiredHoldsScheduler] Erreur lors de l'expiration de la réservation ${booking.id}: ${msg}`,
          );
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}
