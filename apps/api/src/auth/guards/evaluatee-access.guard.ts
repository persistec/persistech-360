import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import {
  CurrentUserPayload,
  AuthenticatedRequest,
} from '../interfaces/auth.interfaces';

@Injectable()
export class EvaluateeAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest & { params: Record<string, string> }>();
    const user: CurrentUserPayload | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (user.role === AppRole.ADMIN) {
      return true;
    }

    const evaluateeId = request.params.evaluateeId;
    if (!evaluateeId) {
      throw new ForbiddenException(
        'Evaluatee ID is required for access control',
      );
    }

    if (user.id !== evaluateeId) {
      throw new ForbiddenException(
        'Employees can only access their own results',
      );
    }

    return true;
  }
}
