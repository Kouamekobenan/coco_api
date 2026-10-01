import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueGateway } from './queue.gateway.js';
import type { ITokenService, TokenPayload } from '../../../auth/application/ports/token-service.port.js';
import {
  QueueTicketCalledEvent,
  QueueTicketStartedEvent,
  QueueTicketCompletedEvent,
  QueueTicketNoShowEvent,
} from '../../domain/events/queue-ticket.events.js';
import { Server, Socket } from 'socket.io';

describe('QueueGateway', () => {
  let gateway: QueueGateway;
  let mockTokenService: ITokenService;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockTokenService = {
      generateTokens: vi.fn(),
      verifyAccessToken: vi.fn(),
      refreshTokens: vi.fn(),
    } as unknown as ITokenService;

    const mockEmit = vi.fn();
    mockServer = {
      to: vi.fn().mockReturnValue({ emit: mockEmit }),
      emit: mockEmit,
    };

    mockSocket = {
      id: 'socket-test-1',
      data: {},
      handshake: {
        auth: {},
        headers: {},
        query: {},
        time: '',
        address: '',
        xdomain: false,
        secure: false,
        issued: 0,
        url: '',
      },
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
    } as unknown as Socket;

    gateway = new QueueGateway(mockTokenService);
    gateway.server = mockServer as Server;
  });

  describe('handleConnection', () => {
    it('devrait connecter un client public sans token et auto-join le salon via query', async () => {
      mockSocket.handshake!.query = { salonId: 'salon-10' };

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.join).toHaveBeenCalledWith('salon:salon-10');
      expect(mockTokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('devrait valider le JWT et auto-join la room customer', async () => {
      mockSocket.handshake!.auth = { token: 'valid-jwt-token' };
      const userPayload: TokenPayload = {
        sub: 'user-42',
        phone: '+2250102030405',
        universe: 'COCO_TAILLE',
        isSuperAdmin: false,
      };
      vi.mocked(mockTokenService.verifyAccessToken).mockResolvedValue(userPayload);

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockSocket.join).toHaveBeenCalledWith('customer:user-42');
      expect(mockSocket.data.user).toEqual(userPayload);
    });
  });

  describe('handleJoinSalon / handleLeaveSalon', () => {
    it('devrait rejoindre la room du salon', async () => {
      const response = await gateway.handleJoinSalon(mockSocket as Socket, { salonId: 'salon-99' });

      expect(mockSocket.join).toHaveBeenCalledWith('salon:salon-99');
      expect(response).toEqual({ status: 'joined', room: 'salon:salon-99' });
    });

    it('devrait quitter la room du salon', async () => {
      const response = await gateway.handleLeaveSalon(mockSocket as Socket, { salonId: 'salon-99' });

      expect(mockSocket.leave).toHaveBeenCalledWith('salon:salon-99');
      expect(response).toEqual({ status: 'left', room: 'salon:salon-99' });
    });
  });

  describe('Diffusions Événementielles', () => {
    it('devrait diffuser ticket:called vers la TV salon et vers le smartphone du client', () => {
      const event = new QueueTicketCalledEvent(
        'ticket-1',
        'salon-5',
        'W-005',
        new Date(),
        10,
        'cust-77',
      );

      gateway.broadcastTicketCalled('salon-5', 'cust-77', event);

      expect(mockServer.to).toHaveBeenCalledWith('salon:salon-5');
      expect(mockServer.to).toHaveBeenCalledWith('customer:cust-77');
    });

    it('devrait diffuser ticket:started vers le salon', () => {
      const event = new QueueTicketStartedEvent('ticket-1', 'salon-5', 'W-005');

      gateway.broadcastTicketStarted('salon-5', event);

      expect(mockServer.to).toHaveBeenCalledWith('salon:salon-5');
    });

    it('devrait diffuser ticket:completed vers le salon', () => {
      const event = new QueueTicketCompletedEvent('ticket-1', 'salon-5', 'W-005');

      gateway.broadcastTicketCompleted('salon-5', event);

      expect(mockServer.to).toHaveBeenCalledWith('salon:salon-5');
    });

    it('devrait diffuser ticket:no_show vers le salon', () => {
      const event = new QueueTicketNoShowEvent('ticket-1', 'salon-5', 'W-005');

      gateway.broadcastTicketNoShow('salon-5', event);

      expect(mockServer.to).toHaveBeenCalledWith('salon:salon-5');
    });
  });
});
