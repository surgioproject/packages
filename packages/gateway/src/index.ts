import 'source-map-support/register'
import { ConfigService } from '@nestjs/config'
import { createServer, IncomingMessage, OutgoingMessage, Server } from 'http'
import serverless, { Handler } from 'serverless-http'

import { bootstrap } from './bootstrap'

export const createHttpServer = (): Server => {
  const prepare = bootstrap().then((nestApp) => {
    return nestApp.init()
  })

  return createServer((req: IncomingMessage, res: OutgoingMessage) => {
    prepare.then((nestApp) => {
      nestApp.getHttpServer().emit('request', req, res)
    })
  })
}

export const startServer = (): Promise<Server> => {
  let port: number

  return bootstrap()
    .then((app) => {
      const configService = app.get<ConfigService>(ConfigService)
      port = configService.get('port') as number

      return app.listen(port)
    })
    .then((httpServer: Server) => {
      console.log('> Your app is ready at http://127.0.0.1:' + port)
      return httpServer
    })
    .catch((err) => {
      console.error('⚠️ 服务启动失败')
      console.error(err)
      process.exit(1)
    })
}

export const createLambdaHandler = () => {
  let handler: Handler

  return async (event, context) => {
    if (!handler) {
      const nestApp = await bootstrap()
      await nestApp.init()
      const adapter = nestApp.getHttpAdapter().getInstance()
      handler = serverless(adapter)
    }

    return await handler(event, context)
  }
}

export const bootstrapServer = bootstrap
