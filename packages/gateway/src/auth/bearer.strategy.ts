import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import _ from 'lodash';

import { Role } from '../constants/role';
import { UserContext } from '../types/app';
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  public async validate(accessToken: string): Promise<UserContext> {
    const isAccessToken = this.authService.validateAccessToken(accessToken);
    const isViewerToken = this.authService.validateViewerToken(accessToken);
    const roles: UserContext['roles'] = [];

    if (!isAccessToken && !isViewerToken) {
      throw new UnauthorizedException();
    }

    if (isViewerToken) {
      roles.push(Role.VIEWER);
    }

    if (isAccessToken) {
      roles.push(Role.ADMIN, Role.VIEWER);
    }

    return { accessToken, roles: _.uniq(roles) };
  }
}
