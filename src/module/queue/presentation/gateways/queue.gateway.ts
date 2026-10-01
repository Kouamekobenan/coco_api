import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  TOKEN_SERVICE,
  type ITokenService,
} from '../../../auth/application/ports/token-service.port.js';
import type {
  QueueTicketCalledEvent,
  QueueTicketStartedEvent,
  QueueTicketCompletedEvent,
  QueueTicketNoShowEvent,
} from '../../domain/events/queue-ticket.events.js';

@WebSocketGateway({
  namespace: '/queue',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name);

  @WebSocketServer()
  public server!: Server;

  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  public async handleConnection(client: Socket): Promise<void> {
    const rawToken =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      client.handshake?.query?.token;

    // Authentification facultative au handshake (pour supporter les écrans TV publics de salon)
    if (rawToken) {
      try {
        const token = typeof rawToken === 'string' && rawToken.startsWith('Bearer ')
          ? rawToken.substring(7).trim()
          : (rawToken as string).trim();

        const payload = await this.tokenService.verifyAccessToken(token);
        client.data.user = payload;

        // Auto-join room client pour recevoir les alertes personnelles
        const customerRoom = `customer:${payload.sub}`;
        await client.join(customerRoom);
        this.logger.log(`Client connecté & authentifié: ${client.id} (Rejoint: ${customerRoom})`);
      } catch (err: unknown) {
        this.logger.warn(`Handshake WebSocket: Token fourni invalide pour client ${client.id}`);
      }
    } else {
      this.logger.log(`Client connecté (Mode public/TV): ${client.id}`);
    }

    // Auto-join salon si passé en paramètre de connexion (ex: TV en salon ?salonId=xyz)
    const salonIdQuery = client.handshake.query?.salonId;
    if (typeof salonIdQuery === 'string' && salonIdQuery.trim().length > 0) {
      const salonRoom = `salon:${salonIdQuery.trim()}`;
      await client.join(salonRoom);
      this.logger.log(`Client ${client.id} a rejoint automatiquement: ${salonRoom}`);
    }
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('join:salon')
  public async handleJoinSalon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { salonId: string },
  ): Promise<{ status: string; room: string }> {
    if (!data?.salonId) {
      return { status: 'error', room: '' };
    }
    const room = `salon:${data.salonId}`;
    await client.join(room);
    this.logger.log(`Socket ${client.id} a rejoint ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave:salon')
  public async handleLeaveSalon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { salonId: string },
  ): Promise<{ status: string; room: string }> {
    if (!data?.salonId) {
      return { status: 'error', room: '' };
    }
    const room = `salon:${data.salonId}`;
    await client.leave(room);
    this.logger.log(`Socket ${client.id} a quitté ${room}`);
    return { status: 'left', room };
  }

  @SubscribeMessage('join:customer')
  public async handleJoinCustomer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { customerId: string },
  ): Promise<{ status: string; room: string }> {
    if (!data?.customerId) {
      return { status: 'error', room: '' };
    }
    const room = `customer:${data.customerId}`;
    await client.join(room);
    this.logger.log(`Socket ${client.id} a rejoint ${room}`);
    return { status: 'joined', room };
  }

  // ── Méthodes de diffusion appelées par le Realtime Listener ────────────────

  public broadcastTicketCalled(
    salonId: string,
    customerId: string | null | undefined,
    event: QueueTicketCalledEvent,
  ): void {
    const salonRoom = `salon:${salonId}`;
    this.logger.log(
      `[Temps Réel] Diffusion ticket:called pour #${event.ticketNumber} sur ${salonRoom}`,
    );

    // 1. Diffusion générale pour l'écran TV du salon (avec signal carillon)
    this.server.to(salonRoom).emit('ticket:called', {
      type: 'TICKET_CALLED',
      ticketId: event.ticketId,
      salonId: event.salonId,
      ticketNumber: event.ticketNumber,
      callDeadlineAt: event.callDeadlineAt,
      graceMinutes: event.graceMinutes,
      calledAt: event.calledAt,
      playChime: true,
    });

    // 2. Notification personnelle ciblée sur le smartphone du client
    if (customerId) {
      const customerRoom = `customer:${customerId}`;
      this.server.to(customerRoom).emit('ticket:called', {
        type: 'YOUR_TURN',
        ticketId: event.ticketId,
        ticketNumber: event.ticketNumber,
        callDeadlineAt: event.callDeadlineAt,
        graceMinutes: event.graceMinutes,
        message: 'C\'est votre tour ! Veuillez vous présenter à l\'accueil.',
      });
    }
  }

  public broadcastTicketStarted(salonId: string, event: QueueTicketStartedEvent): void {
    const salonRoom = `salon:${salonId}`;
    this.logger.log(
      `[Temps Réel] Diffusion ticket:started pour #${event.ticketNumber} sur ${salonRoom}`,
    );

    this.server.to(salonRoom).emit('ticket:started', {
      type: 'TICKET_STARTED',
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      startedAt: event.startedAt,
    });
  }

  public broadcastTicketCompleted(salonId: string, event: QueueTicketCompletedEvent): void {
    const salonRoom = `salon:${salonId}`;
    this.logger.log(
      `[Temps Réel] Diffusion ticket:completed pour #${event.ticketNumber} sur ${salonRoom}`,
    );

    this.server.to(salonRoom).emit('ticket:completed', {
      type: 'TICKET_COMPLETED',
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      completedAt: event.completedAt,
    });
  }

  public broadcastTicketNoShow(salonId: string, event: QueueTicketNoShowEvent): void {
    const salonRoom = `salon:${salonId}`;
    this.logger.log(
      `[Temps Réel] Diffusion ticket:no_show pour #${event.ticketNumber} sur ${salonRoom}`,
    );

    this.server.to(salonRoom).emit('ticket:no_show', {
      type: 'TICKET_NO_SHOW',
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      markedAt: event.markedAt,
    });
  }

  public broadcastQueueUpdated(salonId: string, meta: { action: string; ticketId?: string }): void {
    const salonRoom = `salon:${salonId}`;
    this.logger.debug(`[Temps Réel] Notification queue:updated sur ${salonRoom}`);

    this.server.to(salonRoom).emit('queue:updated', {
      action: meta.action,
      ticketId: meta.ticketId,
      timestamp: new Date(),
    });
  }
}
