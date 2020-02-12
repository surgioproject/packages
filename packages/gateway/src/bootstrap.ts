import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import FastifyCookie from 'fastify-cookie';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: 'warn',
        serializers: {
          req(req: any): any {
            return {
              method: req.method,
              url: req.url,
              'user-agent': req.headers['user-agent'] || '-',
              hostname: req.hostname,
              remoteAddress: req.ip,
              remotePort: req.connection.remotePort
            }
          }
        },
        prettyPrint: true,
      },
    })
  );
  const configService = app.get('ConfigService');
  const port = configService.get('port');
  const secret = configService.get('secret');

  app.useGlobalFilters(new HttpExceptionFilter());

  app.register(FastifyCookie, {
    secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
  });

  await app.listen(port);

  console.log('> Your app is ready at http://127.0.0.1:' + port);
}
