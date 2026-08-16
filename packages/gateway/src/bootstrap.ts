import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import express from 'express'

import { AppModule } from './app.module.js'
import { AppExceptionsFilter } from './filter/app-exception.filter.js'
import { createAdapter } from './app.adapter.js'

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    createAdapter(),
    {
      logger:
        process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['verbose'],
    }
  )

  applyMiddlwares(app)

  return app
}

export function applyMiddlwares(
  app: NestExpressApplication
): NestExpressApplication {
  app.set('query parser', 'extended')
  app.useGlobalFilters(new AppExceptionsFilter())
  app.use(express.json())

  return app
}
