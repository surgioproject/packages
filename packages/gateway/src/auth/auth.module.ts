import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service.js'
import { BearerStrategy } from './bearer.strategy.js'
import { CookieStrategy } from './cookie.strategy.js'

@Module({
  imports: [PassportModule],
  providers: [AuthService, BearerStrategy, CookieStrategy],
  exports: [AuthService],
})
export class AuthModule {}
