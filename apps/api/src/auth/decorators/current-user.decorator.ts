import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User, AppRole } from '@prisma/client';

export type CurrentUserPayload = {
  id: string;
  email: string;
  role: AppRole;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
