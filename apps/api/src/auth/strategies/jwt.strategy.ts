import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  CurrentUserPayload,
  CookieRequest,
} from '../interfaces/auth.interfaces';

function requireConfig(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }
  return value;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const cookieName = 'PERSISTECH360_SESSION';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: CookieRequest) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies[cookieName];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: requireConfig(configService, 'JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): CurrentUserPayload {
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
