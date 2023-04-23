import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { BearerStrategy } from './bearer.strategy'
import { CookieStrategy } from './cookie.strategy'
import { RolesGuard } from './roles.guard'

@Module({
  imports: [PassportModule],
  providers: [
    AuthService,
    BearerStrategy,
    CookieStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AuthModule {}
