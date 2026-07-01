import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
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
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const cookieName = 'PERSISTECH360_SESSION';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: CookieRequest) => {
          let token: string | null = null;
          if (request && request.cookies) {
            token = (request.cookies[cookieName] as string | undefined) ?? null;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: requireConfig(configService, 'JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserPayload> {
    if (!payload.id || !payload.email || !payload.role) {
      throw new UnauthorizedException(
        'Token de sessão inválido (payload incompleto).',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, workspaceEmail: true, appRole: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Utilizador associado ao token não encontrado.',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('A sua conta está inactiva.');
    }

    // Reconstruct payload directly from the database to ensure roles and emails are up-to-date
    return {
      id: user.id,
      email: user.workspaceEmail,
      role: user.appRole,
    };
  }
}
