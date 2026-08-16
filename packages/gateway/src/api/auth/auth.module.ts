import { MiddlewareConsumer, Module } from '@nestjs/common'

import { AuthModule } from '../../auth/auth.module.js'
import { FixCookieMiddleware } from '../../middleware/fix-cookie.middleware.js'

import { AuthController } from './auth.controller.js'

@Module({
  controllers: [AuthController],
  imports: [AuthModule],
})
export class AuthAPIModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(FixCookieMiddleware)
      .forRoutes('api/auth/logout', 'api/auth/validate-cookie')
  }
}
