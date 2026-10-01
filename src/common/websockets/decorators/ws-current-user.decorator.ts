import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedSocket } from '../guards/ws-jwt.guard.js';

export const WsCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.data?.user;
    return data && user ? (user as unknown as Record<string, unknown>)[data] : user;
  },
);
