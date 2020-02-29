import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ServerFactoryFunction } from 'fastify';
import FastifyCookie from 'fastify-cookie';

import { AppModule } from './app.module';
import { AppExceptionsFilter } from './filter/app-exception.filter';
import { createAdapter } from './app.adapter';

export interface BootstrapOptions {
  readonly serverFactory?: ServerFactoryFunction;
}
export async function bootstrap(options: BootstrapOptions = {}): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    createAdapter({
      serverFactory: options.serverFactory,
    }),
  );
  const configService = app.get('ConfigService');
  const secret = configService.get('secret');

  app.useGlobalFilters(new AppExceptionsFilter());

  app.register(FastifyCookie, {
    secret, // for cookies signature
    parseOptions: {}, // options for parsing cookies
  });

  return app;
}
