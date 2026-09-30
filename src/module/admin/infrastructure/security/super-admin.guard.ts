import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { TokenPayload } from '../../../auth/application/ports/token-service.port.js';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentification requise.');
    }

    if (!user.isSuperAdmin) {
      throw new ForbiddenException(
        'Accès refusé : ce point d\'entrée requiert les privilèges Super-Administrateur Coco Platform.',
      );
    }

    return true;
  }
}
