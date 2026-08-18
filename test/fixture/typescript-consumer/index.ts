import { createGatewayApp } from '@surgio/gateway'
import { createLambdaHandler } from '@surgio/gateway/lambda'
import { createHttpServer, startServer } from '@surgio/gateway/node'
import getFrontendPackage from '@surgio/gateway-frontend'
import {
  createLogger,
  logger,
  transports,
  type CreateLoggerOptions,
} from '@surgio/logger'

const options: CreateLoggerOptions = {
  service: 'typescript-consumer',
}

void createGatewayApp
void createHttpServer
void createLambdaHandler
void startServer
void getFrontendPackage
void createLogger(options)
void logger
void transports
