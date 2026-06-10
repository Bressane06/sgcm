import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '../exceptions';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserPayload } from '../../modules/auth/models/user-payload.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload | undefined;

    if (!user || !allowedRoles.includes(user.type)) {
      throw new ForbiddenException(
        'Seu perfil não tem permissão para acessar este recurso.',
      );
    }

    return true;
  }
}
