import { NowRequest, NowResponse } from '@now/node/dist';
import { ServerFactoryFunction, ServerFactoryHandlerFunction } from 'fastify';
import { createServer } from 'http';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): any => {
  let nowHandler: ServerFactoryHandlerFunction;
  const serverFactory: ServerFactoryFunction = handler => {
    nowHandler = (req, res) => {
      handler(req, res);
    };
    return createServer(nowHandler);
  };
  const server = bootstrap({
    serverFactory,
  })
    .then(app => {
      return app.init()
        .then(() => app.getHttpAdapter().getInstance().ready())
    });

  return async (req: NowRequest, res: NowResponse) => {
    await server;

    return nowHandler(req, res);
  };
};

export const startServer = (): Promise<void> => {
  return bootstrap()
    .then(app => {
      const configService = app.get('ConfigService');
      const port = configService.get('port');

      return app.listen(port)
        .then(() => {
          console.log('> Your app is ready at http://127.0.0.1:' + port);
        });
    })
    .catch(err => {
      console.error('⚠️ 服务启动失败');
      console.error(err);
      process.exit(1);
    });
};

export const bootstrapServer = bootstrap;
