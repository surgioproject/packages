import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { BearerStrategy } from './bearer.strategy'
import { CookieStrategy } from './cookie.strategy'

@Module({
  imports: [PassportModule],
  providers: [AuthService, BearerStrategy, CookieStrategy],
  exports: [AuthService],
})
export class AuthModule {}
