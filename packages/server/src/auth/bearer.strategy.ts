import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  public async validate(accessToken: string): Promise<{readonly accessToken: string}> {
    const result = await this.authService.validateAccessToken(accessToken);
    if (!result) {
      throw new UnauthorizedException();
    }
    return { accessToken };
  }
}
