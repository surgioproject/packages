import _ from 'lodash'
import { Strategy } from 'passport-cookie'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException, Req } from '@nestjs/common'
import { Request } from 'express'

import { Role } from '../constants/role'
import { SurgioService } from '../surgio/surgio.service'
import { UserContext } from '../types/app'
import { AuthService } from './auth.service'

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly d: SurgioService
  ) {
    super({
      cookieName: '_t',
      signed: false,
      passReqToCallback: true,
    })
  }

  public async validate(
    @Req() req: Request,
    cookie: string
  ): Promise<UserContext> {
    const isAccessToken = this.authService.validateSignedAccessToken(cookie)
    const isViewerToken = this.authService.validateViewerToken(cookie)
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

    return {
      accessToken: this.d.surgioHelper.config?.gateway?.accessToken as string,
      roles: _.uniq(roles),
    }
  }
}
