import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import getPackage from '@surgio/gateway-frontend'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AppController } from './app.controller.js'
import { ApiModule } from './api/api.module.js'
import { CookieParserMiddleware } from './middleware/cookie-parser.middleware.js'
import { PrepareMiddleware } from './middleware/prepare.middleware.js'
import { SurgioModule } from './surgio/surgio.module.js'
import { SurgioService } from './surgio/surgio.service.js'
import { AuthModule } from './auth/auth.module.js'
import configuration from './config/configuration.js'

const frontendEntry = fileURLToPath(
  import.meta.resolve('@surgio/gateway-frontend')
)
const frontendPackage = getPackage()

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(dirname(frontendEntry), 'build'),
      serveStaticOptions: {
        cacheControl: true,
        etag: true,
        maxAge: '31d',
        setHeaders: (res, path) => {
          if (
            path.endsWith('.js') ||
            path.endsWith('.css') ||
            path.endsWith('.json')
          ) {
            res.setHeader('x-frontend-version', frontendPackage.version)
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
})
export class AppModule {
  constructor(private surgioService: SurgioService) {}

  configure(consumer: MiddlewareConsumer): void {
    const secret = this.surgioService.surgioHelper.configHash

    CookieParserMiddleware.configure(secret)
    consumer.apply(CookieParserMiddleware).forRoutes('{*splat}')

    consumer
      .apply(PrepareMiddleware)
      .exclude({ path: 'render', method: RequestMethod.ALL })
      .forRoutes(AppController)
  }
}
