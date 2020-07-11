import 'source-map-support/register';
import { ConfigService } from '@nestjs/config';
import { NowRequest, NowResponse } from '@now/node/dist';
import { createServer, Server } from 'http';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): Server => {
  const prepare = bootstrap()
    .then(nestApp => {
      return nestApp.init();
    });

  return createServer((req: NowRequest, res: NowResponse) => {
    prepare.then(nestApp => {
      nestApp.getHttpServer().emit('request', req, res);
    });
  });
};

export const startServer = (): Promise<Server> => {
  let port: number;

  return bootstrap()
    .then(app => {
      const configService = app.get<ConfigService>('ConfigService');
      port = configService.get('port') as number;

      return app.listen(port);
    })
    .then((httpServer: Server) => {
      console.log('> Your app is ready at http://127.0.0.1:' + port);
      return httpServer;
    })
    .catch(err => {
      console.error('⚠️ 服务启动失败');
      console.error(err);
      process.exit(1);
    });
};

export const bootstrapServer = bootstrap;
