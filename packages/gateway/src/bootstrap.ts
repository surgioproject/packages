import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import FastifyCookie from 'fastify-cookie';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import fastifyAdapter from './app.adapter';

export async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  const configService = app.get('ConfigService');
  const secret = configService.get('secret');

  app.useGlobalFilters(new HttpExceptionFilter());

  app.register(FastifyCookie, {
    secret, // for cookies signature
    parseOptions: {}, // options for parsing cookies
  });

  return app;
}
