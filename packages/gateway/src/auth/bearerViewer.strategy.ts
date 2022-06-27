import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';

@Injectable()
export class BearerViewerStrategy extends PassportStrategy(
  Strategy,
  'viewerToken'
) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  public async validate(
    accessToken: string
  ): Promise<{ readonly accessToken: string }> {
    const accessTokenResult = this.authService.validateAccessToken(accessToken);

    if (accessTokenResult) {
      return { accessToken };
    }

    const viewerTokenResult = this.authService.validateViewerToken(accessToken);

    if (viewerTokenResult) {
      return { accessToken };
    }

    throw new UnauthorizedException();
  }
}
