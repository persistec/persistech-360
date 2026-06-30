import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'mock-id',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'mock-secret',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails } = profile;
    const email = emails[0].value;

    // Only previously authorized internal users can login.
    // Try to find the user by their googleSub or workspaceEmail.
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleSub: id }, { workspaceEmail: email }],
      },
    });

    if (!user) {
      // User not found in our database - deny access (no open registration)
      return done(
        new ForbiddenException('Conta Google não autorizada.'),
        false,
      );
    }

    if (user.status !== 'ACTIVE') {
      return done(new ForbiddenException('Conta inactiva.'), false);
    }

    // Link googleSub if not already linked (progressive migration)
    if (!user.googleSub) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleSub: id },
      });
    }

    const payload = {
      id: user.id,
      email: user.workspaceEmail,
      role: user.appRole,
    };

    done(null, payload);
  }
}
