import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserPayload } from '../interfaces/auth.interfaces';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  handleRequest<TUser = CurrentUserPayload>(
    err: Error | null,
    user: CurrentUserPayload | false | null,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Acesso negado');
    }
    return user as unknown as TUser;
  }
}
