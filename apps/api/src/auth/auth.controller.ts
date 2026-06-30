/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
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
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth2 login flow' })
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 flow via Passport.
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const token = this.authService.generateJwt(req.user as CurrentUserPayload);
    const cookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') ||
      'PERSISTECH360_SESSION';
    const isSecure =
      this.configService.get<string>('AUTH_COOKIE_SECURE') === 'true';
    const webAppUrl =
      this.configService.get<string>('WEB_APP_URL') || 'http://localhost:3000';

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.redirect(webAppUrl + '/app');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('PERSISTECH360_SESSION')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Return current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('PERSISTECH360_SESSION')
  @ApiOperation({ summary: 'Logout and clear session cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    const cookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') ||
      'PERSISTECH360_SESSION';
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: this.configService.get<string>('AUTH_COOKIE_SECURE') === 'true',
      sameSite:
        this.configService.get<string>('AUTH_COOKIE_SECURE') === 'true'
          ? 'none'
          : 'lax',
      path: '/',
    });
    return { success: true };
  }
}
