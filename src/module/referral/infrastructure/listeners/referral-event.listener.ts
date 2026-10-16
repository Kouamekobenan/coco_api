import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AUTH_EVENT_PATTERNS,
  UserRegisteredEvent,
} from '../../../auth/domain/events/auth.events.js';
import { ReferralUseCase } from '../../application/usecases/referral.usecase.js';

@Injectable()
export class ReferralEventListener {
  private readonly logger = new Logger(ReferralEventListener.name);

  constructor(private readonly referralUseCase: ReferralUseCase) {}

  @OnEvent(AUTH_EVENT_PATTERNS.USER_REGISTERED, { async: true })
  public async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
    try {
      await this.referralUseCase.handleNewUser(event.userId, event.referralCode);
    } catch (error) {
      // Le parrainage ne doit jamais bloquer l'inscription
      this.logger.error(
        `Erreur parrainage pour l'utilisateur ${event.userId}: ${(error as Error).message}`,
      );
    }
  }
}
