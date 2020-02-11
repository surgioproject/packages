import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sign from 'cookie-signature';

import { AuthService } from './auth.service';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    super({
      cookieName: '_t',
      passReqToCallback: true,
    });
  }

  public async validate(@Req() req, tokenCookie: string): Promise<{readonly accessToken: string}> {
    const accessToken = sign.unsign(tokenCookie, this.configService.get('secret'));
    const result = await this.authService.validateAccessToken(accessToken);
    if (!result) {
      throw new UnauthorizedException();
    }
    return { accessToken };
  }
}
