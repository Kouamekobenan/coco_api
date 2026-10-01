import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueRealtimeEventListener } from './queue-realtime-event.listener.js';
import { QueueGateway } from '../../presentation/gateways/queue.gateway.js';
import {
  QueueTicketCalledEvent,
  QueueTicketStartedEvent,
  QueueTicketCompletedEvent,
  QueueTicketNoShowEvent,
  QueueTicketCreatedEvent,
} from '../../domain/events/queue-ticket.events.js';

describe('QueueRealtimeEventListener', () => {
  let listener: QueueRealtimeEventListener;
  let mockGateway: Partial<QueueGateway>;

  beforeEach(() => {
    mockGateway = {
      broadcastTicketCalled: vi.fn(),
      broadcastTicketStarted: vi.fn(),
      broadcastTicketCompleted: vi.fn(),
      broadcastTicketNoShow: vi.fn(),
      broadcastQueueUpdated: vi.fn(),
    };

    listener = new QueueRealtimeEventListener(mockGateway as QueueGateway);
  });

  it('devrait relayer l événement ticket appelé vers la gateway Socket.io', () => {
    const event = new QueueTicketCalledEvent(
      'ticket-1',
      'salon-1',
      'W-001',
      new Date(),
      10,
      'cust-1',
    );

    listener.handleTicketCalled(event);

    expect(mockGateway.broadcastTicketCalled).toHaveBeenCalledWith('salon-1', 'cust-1', event);
    expect(mockGateway.broadcastQueueUpdated).toHaveBeenCalledWith('salon-1', {
      action: 'CALLED',
      ticketId: 'ticket-1',
    });
  });

  it('devrait relayer l événement ticket démarré', () => {
    const event = new QueueTicketStartedEvent('ticket-1', 'salon-1', 'W-001');

    listener.handleTicketStarted(event);

    expect(mockGateway.broadcastTicketStarted).toHaveBeenCalledWith('salon-1', event);
    expect(mockGateway.broadcastQueueUpdated).toHaveBeenCalledWith('salon-1', {
      action: 'STARTED',
      ticketId: 'ticket-1',
    });
  });

  it('devrait relayer l événement ticket terminé', () => {
    const event = new QueueTicketCompletedEvent('ticket-1', 'salon-1', 'W-001');

    listener.handleTicketCompleted(event);

    expect(mockGateway.broadcastTicketCompleted).toHaveBeenCalledWith('salon-1', event);
    expect(mockGateway.broadcastQueueUpdated).toHaveBeenCalledWith('salon-1', {
      action: 'COMPLETED',
      ticketId: 'ticket-1',
    });
  });

  it('devrait relayer l événement ticket no-show', () => {
    const event = new QueueTicketNoShowEvent('ticket-1', 'salon-1', 'W-001');

    listener.handleTicketNoShow(event);

    expect(mockGateway.broadcastTicketNoShow).toHaveBeenCalledWith('salon-1', event);
    expect(mockGateway.broadcastQueueUpdated).toHaveBeenCalledWith('salon-1', {
      action: 'NO_SHOW',
      ticketId: 'ticket-1',
    });
  });

  it('devrait relayer l événement création de ticket pour rafraîchir la file', () => {
    const event = new QueueTicketCreatedEvent('ticket-1', 'salon-1', 'W-001', 'WALK_IN', 'cust-1');

    listener.handleTicketCreated(event);

    expect(mockGateway.broadcastQueueUpdated).toHaveBeenCalledWith('salon-1', {
      action: 'CREATED',
      ticketId: 'ticket-1',
    });
  });
});
