import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppRole, User } from '@prisma/client';

@Injectable()
export class AppRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!requiredRoles.includes(user.appRole)) {
      throw new ForbiddenException(
        `Require one of roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
