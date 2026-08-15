import {
  bootstrapServer,
  createHttpServer,
  createLambdaHandler,
  startServer,
} from '@surgio/gateway'
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

void bootstrapServer
void createHttpServer
void createLambdaHandler
void startServer
void getFrontendPackage
void createLogger(options)
void logger
void transports
