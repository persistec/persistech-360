import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  handleRequest<TUser>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Acesso negado');
    }
    return user as TUser;
  }
}
