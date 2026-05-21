import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/is-public.decorator';
import { Observable } from 'rxjs';
import { UnauthorizedException } from '../../../common/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // Baseado na implementação padrão do AuthGuard, conforme estava
  // no enunciado da etapa 2.
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (user) 
      return user;

    const infoName = (info as { name?: string } | undefined)?.name;
    const infoMessage =
      (info as { message?: string } | undefined)?.message ||
      (err as { message?: string } | undefined)?.message ||
      '';

    // token expirado
    if (infoName === 'TokenExpiredError') 
      throw new UnauthorizedException(
        'O token de acesso expirou. Utilize o endpoint /auth/refresh para renová-lo.',
      );
    

    // token inválido ou adulterado
    if (
      infoName === 'JsonWebTokenError' ||
      infoName === 'NotBeforeError' ||
      /invalid|malformed|signature|jwt/i.test(infoMessage)
    ) 
      throw new UnauthorizedException(
        'O token fornecido é inválido ou foi adulterado.',
      );
    

    // token ausente
    if (/no auth token|missing auth token|no authorization token/i.test(infoMessage)) 
      throw new UnauthorizedException(
        'Nenhum token de autenticação foi fornecido.',
      );
  
    // outros erros relacionados à autenticação
    if (err || !user) 
      throw new UnauthorizedException(
        'Nenhum token de autenticação foi fornecido.',
      );
    

    return user;
  }
}
