export const QUEUE_EVENT_PATTERNS = {
  TICKET_CREATED: 'queue.ticket.created',
  TICKET_CALLED: 'queue.ticket.called',
  TICKET_STARTED: 'queue.ticket.started',
  TICKET_COMPLETED: 'queue.ticket.completed',
  TICKET_LEFT: 'queue.ticket.left',
  TICKET_NO_SHOW: 'queue.ticket.no_show',
} as const;

export class QueueTicketCreatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly queueType: string,
    public readonly customerId?: string | null,
  ) {}
}

export class QueueTicketCalledEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly callDeadlineAt: Date,
    public readonly graceMinutes: number = 10,
    public readonly customerId?: string | null,
    public readonly calledAt: Date = new Date(),
  ) {}
}

export class QueueTicketStartedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly startedAt: Date = new Date(),
  ) {}
}

export class QueueTicketCompletedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly completedAt: Date = new Date(),
  ) {}
}

export class QueueTicketLeftEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly leftAt: Date = new Date(),
  ) {}
}

export class QueueTicketNoShowEvent {
  constructor(
    public readonly ticketId: string,
    public readonly salonId: string,
    public readonly ticketNumber: string,
    public readonly markedAt: Date = new Date(),
  ) {}
}
