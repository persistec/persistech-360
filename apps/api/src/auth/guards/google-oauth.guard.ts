import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      // The google strategy threw an error (e.g. account not found/inactive)
      throw err || new UnauthorizedException('Acesso negado');
    }
    return user;
  }
}
