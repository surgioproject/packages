import gateway = require('@surgio/gateway')
import getFrontendPackage = require('@surgio/gateway-frontend')
import loggerPackage = require('@surgio/logger')

const frontendPackage = getFrontendPackage()
const logger = loggerPackage.createLogger({
  service: 'typescript-consumer-cjs',
})

void gateway.bootstrapServer
void gateway.createHttpServer
void gateway.createLambdaHandler
void gateway.startServer
void frontendPackage.name
void frontendPackage.version
void logger
void loggerPackage.logger
void loggerPackage.transports
