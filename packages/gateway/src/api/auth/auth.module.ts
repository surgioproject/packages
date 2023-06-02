import { MiddlewareConsumer, Module } from '@nestjs/common'
import { FixCookieMiddleware } from '../../middleware/fix-cookie.middleware'

import { AuthController } from './auth.controller'

@Module({
  controllers: [AuthController],
})
export class AuthAPIModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(FixCookieMiddleware)
      .forRoutes('api/auth/logout', 'api/auth/validate-cookie')
  }
}
