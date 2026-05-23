import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../../modules/auth/models/user-payload.model';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserPayload;
  },
);