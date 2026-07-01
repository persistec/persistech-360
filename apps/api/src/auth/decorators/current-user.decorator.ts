import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  CurrentUserPayload,
  AuthenticatedRequest,
} from '../interfaces/auth.interfaces';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error(
        'CurrentUser decorator used outside of an authenticated context',
      );
    }
    return request.user;
  },
);
