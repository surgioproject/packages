import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

const PORT = process.env.PORT || 4000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.listen(PORT);

  console.log('> Your app is ready at http://127.0.0.1:' + PORT);
}

bootstrap();
