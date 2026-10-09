import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationChannel } from '@prisma/client';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketCalledEvent,
  QueueTicketNoShowEvent,
  QueueTicketCreatedEvent,
} from '../../../queue/domain/events/queue-ticket.events.js';
import {
  BOOKING_EVENT_PATTERNS,
  BookingDepositConfirmedEvent,
  BookingCancelledEvent,
  BookingDelayUpdatedEvent,
  BookingCreatedEvent,
  BookingCompletedEvent,
  BookingNoShowEvent,
  BookingHoldExpiredEvent,
  BookingReminderEvent,
} from '../../../booking/domain/events/booking.events.js';
import {
  AUTH_EVENT_PATTERNS,
  UserRegisteredEvent,
} from '../../../auth/domain/events/auth.events.js';
import { SendNotificationUseCase } from '../../application/usecases/send-notification.usecase.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CREATED, { async: true })
  public async handleTicketCreated(event: QueueTicketCreatedEvent): Promise<void> {
    if (!event.customerId) return;

    this.logger.log(
      `[NotificationEventListener] Notification création ticket #${event.ticketNumber} pour client: ${event.customerId}`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: `Ticket #${event.ticketNumber} enregistré 🎟️`,
        body: `Votre passage a bien été enregistré dans la file d'attente. Nous vous avertirons dès que votre tour sera proche !`,
        data: {
          type: 'TICKET_CREATED',
          ticketId: event.ticketId,
          ticketNumber: event.ticketNumber,
          queueType: event.queueType,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification TICKET_CREATED: ${msg}`);
    }
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CALLED, { async: true })
  public async handleTicketCalled(event: QueueTicketCalledEvent): Promise<void> {
    if (!event.customerId) return;

    this.logger.log(
      `[NotificationEventListener] Déclenchement alerte appel ticket #${event.ticketNumber} pour client: ${event.customerId}`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: `C'est votre tour ! (Ticket #${event.ticketNumber})`,
        body: `Votre ticket #${event.ticketNumber} vient d'être appelé. Vous disposez de ${event.graceMinutes} minutes pour vous présenter au fauteuil.`,
        data: {
          type: 'TICKET_CALLED',
          ticketId: event.ticketId,
          ticketNumber: event.ticketNumber,
          callDeadlineAt: event.callDeadlineAt.toISOString(),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification TICKET_CALLED: ${msg}`);
    }
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW, { async: true })
  public async handleTicketNoShow(event: QueueTicketNoShowEvent & { customerId?: string }): Promise<void> {
    if (!event.customerId) return;

    this.logger.log(
      `[NotificationEventListener] Notification No-Show pour ticket #${event.ticketNumber} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: `Délai expiré (Ticket #${event.ticketNumber})`,
        body: `Le délai de présentation pour votre ticket #${event.ticketNumber} a expiré. Votre passage a été annulé.`,
        data: {
          type: 'TICKET_NO_SHOW',
          ticketId: event.ticketId,
          ticketNumber: event.ticketNumber,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification TICKET_NO_SHOW: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CREATED, { async: true })
  public async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    this.logger.log(
      `[NotificationEventListener] Notification création réservation ${event.bookingId} (client: ${event.customerId})`,
    );

    try {
      const title = event.requiresDeposit
        ? 'Réservation en attente d\'acompte ⏳'
        : 'Réservation confirmée ! 🎉';

      const body = event.requiresDeposit
        ? 'Votre réservation a été pré-enregistrée. Veuillez régler l\'acompte afin de garantir définitivement votre créneau.'
        : 'Votre rendez-vous a bien été enregistré au salon. À très bientôt !';

      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title,
        body,
        data: {
          type: 'BOOKING_CREATED',
          bookingId: event.bookingId,
          requiresDeposit: event.requiresDeposit,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_CREATED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DEPOSIT_CONFIRMED, { async: true })
  public async handleBookingDepositConfirmed(event: BookingDepositConfirmedEvent): Promise<void> {
    this.logger.log(
      `[NotificationEventListener] Confirmation paiement acompte pour réservation ${event.bookingId} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Réservation confirmée ! 🎉',
        body: `Votre acompte de ${event.depositAmount} FCFA a été validé avec succès. Votre créneau est garanti.`,
        data: {
          type: 'BOOKING_DEPOSIT_CONFIRMED',
          bookingId: event.bookingId,
          depositAmount: event.depositAmount,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_DEPOSIT_CONFIRMED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_COMPLETED, { async: true })
  public async handleBookingCompleted(event: BookingCompletedEvent): Promise<void> {
    this.logger.log(
      `[NotificationEventListener] Prestation terminée pour réservation ${event.bookingId} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Merci pour votre visite ! ⭐',
        body: 'Votre prestation est terminée. Comment s\'est passée votre séance ? Laissez une note et un avis au salon !',
        data: {
          type: 'BOOKING_COMPLETED',
          bookingId: event.bookingId,
          totalPrice: event.totalPrice,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_COMPLETED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_CANCELLED, { async: true })
  public async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Réservation annulée',
        body: event.reason
          ? `Votre réservation a été annulée pour le motif suivant: ${event.reason}`
          : 'Votre réservation a été annulée.',
        data: {
          type: 'BOOKING_CANCELLED',
          bookingId: event.bookingId,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_CANCELLED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_NO_SHOW, { async: true })
  public async handleBookingNoShow(event: BookingNoShowEvent): Promise<void> {
    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Rendez-vous manqué',
        body: 'Vous ne vous êtes pas présenté à votre rendez-vous. Vous pouvez réserver un nouveau créneau dès que vous le souhaitez.',
        data: {
          type: 'BOOKING_NO_SHOW',
          bookingId: event.bookingId,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_NO_SHOW: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_EXPIRED, { async: true })
  public async handleBookingHoldExpired(event: BookingHoldExpiredEvent): Promise<void> {
    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Délai d\'acompte expiré',
        body: 'Le délai imparti pour le règlement de votre acompte a expiré. Votre réservation a été annulée et le créneau libéré.',
        data: {
          type: 'BOOKING_EXPIRED',
          bookingId: event.bookingId,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_EXPIRED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_DELAY_UPDATED, { async: true })
  public async handleBookingDelayUpdated(event: BookingDelayUpdatedEvent): Promise<void> {
    if (!event.isAlertSent) return;

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Mise à jour de l\'horaire',
        body: `Un retard estimé de ${event.delayMinutes} minutes est à prévoir sur votre rendez-vous. Merci de votre compréhension.`,
        data: {
          type: 'BOOKING_DELAY_ALERT',
          bookingId: event.bookingId,
          delayMinutes: event.delayMinutes,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_DELAY_UPDATED: ${msg}`);
    }
  }

  @OnEvent(BOOKING_EVENT_PATTERNS.BOOKING_REMINDER, { async: true })
  public async handleBookingReminder(event: BookingReminderEvent): Promise<void> {
    const timeFormatted = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Abidjan',
    }).format(new Date(event.scheduledStart));

    this.logger.log(
      `[NotificationEventListener] Envoi rappel 2h pour réservation ${event.bookingId} (client: ${event.customerId})`,
    );

    try {
      await this.sendNotificationUseCase.execute({
        userId: event.customerId,
        salonId: event.salonId,
        title: 'Rappel de rendez-vous dans 2h ⏰',
        body: `Votre séance est prévue aujourd'hui à ${timeFormatted}. Votre créneau vous attend au salon !`,
        data: {
          type: 'BOOKING_REMINDER',
          bookingId: event.bookingId,
          scheduledStart: new Date(event.scheduledStart).toISOString(),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification BOOKING_REMINDER: ${msg}`);
    }
  }

  @OnEvent(AUTH_EVENT_PATTERNS.USER_REGISTERED, { async: true })
  public async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(
      `[NotificationEventListener] Réception USER_REGISTERED pour le client: ${event.userId} (${event.nationalPhone})`,
    );

    try {
      // 1. Récupération de tous les super-administrateurs actifs de la plateforme
      const admins = await this.prisma.user.findMany({
        where: {
          isSuperAdmin: true,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          phone: true,
        },
      });

      if (admins.length === 0) {
        this.logger.warn(
          `[NotificationEventListener] Aucun super-administrateur actif trouvé pour notifier la création du compte client: ${event.userId}`,
        );
        return;
      }

      const clientDisplayName =
        event.fullName ||
        [event.firstName, event.lastName].filter(Boolean).join(' ').trim() ||
        event.nationalPhone;

      // 2. Notification Push et In-App à chaque administrateur
      for (const admin of admins) {
        await this.sendNotificationUseCase.execute({
          userId: admin.id,
          title: 'Nouveau compte client créé 👤',
          body: `Le client ${clientDisplayName} (${event.nationalPhone}) vient de créer son compte sur Coco.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
          data: {
            type: 'USER_REGISTERED',
            clientId: event.userId,
            clientPhone: event.phone,
            clientNationalPhone: event.nationalPhone,
            clientEmail: event.email ?? '',
            universe: event.universe,
            registeredAt: event.createdAt.toISOString(),
          },
        });
      }

      this.logger.log(
        `[NotificationEventListener] Alertes PUSH & IN_APP envoyées à ${admins.length} administrateur(s) pour le nouveau client ${event.userId}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Erreur notification USER_REGISTERED: ${msg}`);
    }
  }
}


