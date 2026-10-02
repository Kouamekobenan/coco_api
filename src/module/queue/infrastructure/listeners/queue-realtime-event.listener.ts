import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueueGateway } from '../../presentation/gateways/queue.gateway.js';
import {
  QUEUE_EVENT_PATTERNS,
  QueueTicketCalledEvent,
  QueueTicketStartedEvent,
  QueueTicketCompletedEvent,
  QueueTicketNoShowEvent,
  QueueTicketLeftEvent,
  QueueTicketCreatedEvent,
} from '../../domain/events/queue-ticket.events.js';

@Injectable()
export class QueueRealtimeEventListener {
  private readonly logger = new Logger(QueueRealtimeEventListener.name);

  constructor(private readonly queueGateway: QueueGateway) {}

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CALLED, { async: true })
  public handleTicketCalled(event: QueueTicketCalledEvent): void {
    this.logger.debug(`Événement reçu: Ticket appelé #${event.ticketNumber}`);
    this.queueGateway.broadcastTicketCalled(event.salonId, event.customerId, event);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'CALLED',
      ticketId: event.ticketId,
    });
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_STARTED, { async: true })
  public handleTicketStarted(event: QueueTicketStartedEvent): void {
    this.logger.debug(`Événement reçu: Prestation démarrée #${event.ticketNumber}`);
    this.queueGateway.broadcastTicketStarted(event.salonId, event);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'STARTED',
      ticketId: event.ticketId,
    });
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_COMPLETED, { async: true })
  public handleTicketCompleted(event: QueueTicketCompletedEvent): void {
    this.logger.debug(`Événement reçu: Ticket terminé #${event.ticketNumber}`);
    this.queueGateway.broadcastTicketCompleted(event.salonId, event);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'COMPLETED',
      ticketId: event.ticketId,
    });
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_NO_SHOW, { async: true })
  public handleTicketNoShow(event: QueueTicketNoShowEvent): void {
    this.logger.debug(`Événement reçu: Ticket No-Show #${event.ticketNumber}`);
    this.queueGateway.broadcastTicketNoShow(event.salonId, event);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'NO_SHOW',
      ticketId: event.ticketId,
    });
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_LEFT, { async: true })
  public handleTicketLeft(event: QueueTicketLeftEvent): void {
    this.logger.debug(`Événement reçu: Client parti #${event.ticketNumber}`);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'LEFT',
      ticketId: event.ticketId,
    });
  }

  @OnEvent(QUEUE_EVENT_PATTERNS.TICKET_CREATED, { async: true })
  public handleTicketCreated(event: QueueTicketCreatedEvent): void {
    this.logger.debug(`Événement reçu: Nouveau ticket créé #${event.ticketNumber}`);
    this.queueGateway.broadcastQueueUpdated(event.salonId, {
      action: 'CREATED',
      ticketId: event.ticketId,
    });
  }

  @OnEvent('notification.received', { async: true })
  public handleNotificationReceived(event: {
    userId: string;
    salonId?: string | null;
    notification: unknown;
  }): void {
    this.logger.debug(`Relais notification In-App pour client ${event.userId}`);
    this.queueGateway.sendNotificationToCustomer(event.userId, event.notification);
  }
}
