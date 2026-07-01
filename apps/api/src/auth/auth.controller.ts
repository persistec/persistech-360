import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from './decorators/current-user.decorator';
import type {
  CurrentUserPayload,
  AuthenticatedRequest,
} from './interfaces/auth.interfaces';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

const SESSION_COOKIE_NAME = 'PERSISTECH360_SESSION';

function getRequiredConfig(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }
  return value;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions() {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const isSecure =
      this.configService.get<string>('AUTH_COOKIE_SECURE') === 'true' ||
      isProduction;
    const cookieDomain = this.configService.get<string>('AUTH_COOKIE_DOMAIN');

    return {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const,
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth2 login flow' })
  googleAuth(): void {
    // Initiates the Google OAuth2 flow via Passport.
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const accessToken = this.authService.generateJwt(user);
    const options = this.getCookieOptions();

    res.cookie(SESSION_COOKIE_NAME, accessToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    let redirectUrl: string;
    if (isProduction) {
      redirectUrl = getRequiredConfig(this.configService, 'WEB_APP_URL');
    } else {
      redirectUrl =
        this.configService.get<string>('WEB_APP_URL') ||
        'http://localhost:3000';
    }

    return res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @ApiOperation({ summary: 'Get current authenticated user payload' })
  @ApiResponse({ status: 200, description: 'Return current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear the authentication cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  logout(@Res({ passthrough: true }) res: Response) {
    const options = this.getCookieOptions();
    res.clearCookie(SESSION_COOKIE_NAME, options);
    return { success: true };
  }
}
