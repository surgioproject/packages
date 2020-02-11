import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { CookieStrategy } from './cookie.strategy';
import { SurgioService } from '../surgio/surgio.service';

@Module({
  imports: [PassportModule],
  providers: [AuthService, BearerStrategy, CookieStrategy, SurgioService],
})
export class AuthModule {}
