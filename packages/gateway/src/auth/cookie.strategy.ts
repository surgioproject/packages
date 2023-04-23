import _ from 'lodash'
import { Strategy } from 'passport-cookie'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException, Req } from '@nestjs/common'
import { Request } from 'express'

import { Role } from '../constants/role'
import { UserContext } from '../types/app'
import { AuthService } from './auth.service'

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      cookieName: '_t',
      signed: true,
      passReqToCallback: true,
    })
  }

  public async validate(
    @Req() req: Request,
    accessToken: string
  ): Promise<UserContext> {
    const isAccessToken = this.authService.validateAccessToken(accessToken)
    const isViewerToken = this.authService.validateViewerToken(accessToken)
    const roles: UserContext['roles'] = []

    if (!isAccessToken && !isViewerToken) {
      throw new UnauthorizedException()
    }

    if (isViewerToken) {
      roles.push(Role.VIEWER)
    }

    if (isAccessToken) {
      roles.push(Role.ADMIN, Role.VIEWER)
    }

    return { accessToken, roles: _.uniq(roles) }
  }
}
