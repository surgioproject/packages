import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      cookieName: '_t',
      signed: true,
      passReqToCallback: true,
    });
  }

  public async validate(
    @Req() req: Request,
    accessToken: string
  ): Promise<{ readonly accessToken: string }> {
    const result = await this.authService.validateAccessToken(accessToken);
    if (!result) {
      throw new UnauthorizedException();
    }
    return { accessToken };
  }
}
