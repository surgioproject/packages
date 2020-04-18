import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { ApiModule } from './api/api.module';
import { PrepareMiddleware } from './middleware/prepare.middleware';
import { SurgioModule } from './surgio/surgio.module';
import { SurgioService } from './surgio/surgio.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';

const FE_MODULE = require.resolve('@surgio/gateway-frontend');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(FE_MODULE, '../build'),
      serveStaticOptions: {
        etag: true,
      },
    }),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [configuration],
    }),
    SurgioModule.register({
      cwd: process.env.SURGIO_PROJECT_DIR || process.cwd(),
    }),
    ApiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [SurgioService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(PrepareMiddleware)
      .exclude(
        { path: 'render', method: RequestMethod.ALL },
      )
      .forRoutes(AppController);
  }
}
