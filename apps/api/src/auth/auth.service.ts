import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CurrentUserPayload } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJwt(user: CurrentUserPayload): string {
    return this.jwtService.sign(user);
  }
}
