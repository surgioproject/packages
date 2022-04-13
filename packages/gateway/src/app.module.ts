import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { ApiModule } from './api/api.module';
import { CookieParserMiddleware } from './middleware/cookie-parser.middleware';
import { PrepareMiddleware } from './middleware/prepare.middleware';
import { SurgioModule } from './surgio/surgio.module';
import { SurgioService } from './surgio/surgio.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import getPackage from '@surgio/gateway-frontend';

const FE_MODULE = require.resolve('@surgio/gateway-frontend');
const frontendPackage = getPackage();

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(FE_MODULE, '../build'),
      serveStaticOptions: {
        etag: true,
        maxAge: '31d',
        setHeaders: (res, path) => {
          if (path.endsWith('.js')) {
            res.setHeader('x-frontend-version', frontendPackage.version);
          }
        },
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
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer): void {
    const secret = this.configService.get('secret');

    CookieParserMiddleware.configure(secret);
    consumer.apply(CookieParserMiddleware).forRoutes('*');

    consumer
      .apply(PrepareMiddleware)
      .exclude({ path: 'render', method: RequestMethod.ALL })
      .forRoutes(AppController);
  }
}
