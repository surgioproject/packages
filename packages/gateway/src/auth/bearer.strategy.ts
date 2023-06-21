import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-http-bearer'
import _ from 'lodash'

import { Role } from '../constants/role'
import { SurgioService } from '../surgio/surgio.service'
import { UserContext } from '../types/app'
import { AuthService } from './auth.service'

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly surgioService: SurgioService
  ) {
    super()
  }

  public async validate(bearerToken: string): Promise<UserContext> {
    const isAccessToken = this.authService.validateAccessToken(bearerToken)
    const isViewerToken = this.authService.validateViewerToken(bearerToken)
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
      accessToken: this.surgioService.surgioHelper.config?.gateway
        ?.accessToken as string,
      roles: _.uniq(roles),
    }
  }
}
