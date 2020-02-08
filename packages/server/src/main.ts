import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import FastifyCookie from 'fastify-cookie';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({})
  );
  const configService = app.get('ConfigService');
  const port = configService.get('port');
  const secret = configService.get('secret');

  app.register(FastifyCookie, {
    secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
  });

  await app.listen(port);

  console.log('> Your app is ready at http://127.0.0.1:' + port);
}

bootstrap();
