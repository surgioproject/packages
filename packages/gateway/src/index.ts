import { NowRequest, NowResponse } from '@now/node/dist';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): ((req: NowRequest, res: NowResponse) => Promise<void>) => {
  let app;
  let state = 'start';
  const prepare = bootstrap()
    .then(nestApp => {
      return nestApp.init()
        .then(() => nestApp.getHttpAdapter().getInstance().ready())
        .then(() => nestApp);
    });

  return async (req: NowRequest, res: NowResponse) => {
    if (process.env.SURGIO_TESTING_STARTUP) {
      switch (state) {
        case 'start':
          res.status(503).send('Under Maintenance');
          state = 'preparing';
          prepare.then(nextApp => {
            app = nextApp;
            state = 'ready';
          });

          break;
        case 'preparing':
          res.status(503).send('Under Maintenance');

          break;
        case 'ready':
          app.getHttpAdapter().getInstance().server.emit('request', req, res);

          break;
      }
    } else {
      const nestApp = await prepare;
      nestApp.getHttpAdapter().getInstance().server.emit('request', req, res);
    }
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
