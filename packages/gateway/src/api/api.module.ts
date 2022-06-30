import { MiddlewareConsumer, Module } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { ApiController } from './api.controller';
import { AuthAPIModule } from './auth/auth.module';
import { ConfigAPIModule } from './config/config.module';

@Module({
  controllers: [ApiController],
  imports: [AuthAPIModule, ConfigAPIModule],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        res.header(
          'cache-control',
          'private, no-cache, no-store, must-revalidate'
        );
        next();
      })
      .forRoutes('api/*');
  }
}
