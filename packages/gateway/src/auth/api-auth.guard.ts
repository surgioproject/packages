import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { Role } from '../constants/role'
import { SurgioService } from '../surgio/surgio.service'
import { EnrichedRequest } from '../types/app'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class APIAuthGuard extends AuthGuard(['cookie', 'bearer']) {
  constructor(
    private surgioService: SurgioService,
    private reflector: Reflector
  ) {
    super()
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const needAuth = this.surgioService.surgioHelper.config?.gateway?.auth
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (needAuth) {
      const authResult = (await super.canActivate(context)) as boolean

      if (!requiredRoles) {
        return authResult
      }

      const { user } = context.switchToHttp().getRequest<EnrichedRequest>()

      return user
        ? requiredRoles.some((role) => user.roles?.includes(role))
        : authResult
    }

    return true
  }
}
