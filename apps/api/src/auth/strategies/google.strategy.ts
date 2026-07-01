import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import {
  GoogleProfile,
  CurrentUserPayload,
} from '../interfaces/auth.interfaces';

function requireConfig(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }
  return value;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: requireConfig(configService, 'GOOGLE_CLIENT_ID'),
      clientSecret: requireConfig(configService, 'GOOGLE_CLIENT_SECRET'),
      callbackURL: requireConfig(configService, 'GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails } = profile;

    if (!emails || emails.length === 0 || !emails[0].value) {
      return done(
        new UnauthorizedException('Conta Google sem email associado.'),
        false,
      );
    }

    const email = emails[0].value.toLowerCase().trim();

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleSub: id }, { workspaceEmail: email }],
      },
    });

    if (!user) {
      return done(
        new ForbiddenException('Conta Google não autorizada.'),
        false,
      );
    }

    if (user.status !== 'ACTIVE') {
      return done(new ForbiddenException('Conta inactiva.'), false);
    }

    if (!user.googleSub) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleSub: id },
      });
    }

    const payload: CurrentUserPayload = {
      id: user.id,
      email: user.workspaceEmail,
      role: user.appRole,
    };

    done(null, payload);
  }
}
