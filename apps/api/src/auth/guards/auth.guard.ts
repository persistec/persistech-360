import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { CurrentUserPayload } from '../interfaces/auth.interfaces';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = CurrentUserPayload>(
    err: Error | null,
    user: CurrentUserPayload | false | null,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Sessão inválida ou ausente');
    }
    return user as unknown as TUser;
  }
}
