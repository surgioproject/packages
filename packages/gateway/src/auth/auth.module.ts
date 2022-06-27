import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { BearerViewerStrategy } from './bearerViewer.strategy';
import { CookieStrategy } from './cookie.strategy';
import { SurgioService } from '../surgio/surgio.service';

@Module({
  imports: [PassportModule],
  providers: [
    AuthService,
    BearerStrategy,
    BearerViewerStrategy,
    CookieStrategy,
    SurgioService,
  ],
})
export class AuthModule {}
