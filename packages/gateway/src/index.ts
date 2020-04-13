import { NowRequest, NowResponse } from '@now/node/dist';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): ((req: NowRequest, res: NowResponse) => Promise<void>) => {
  const ready = bootstrap()
    .then(app => {
      return app.init()
        .then(() => app.getHttpAdapter().getInstance().ready())
        .then(() => app);
    });

  return async (req: NowRequest, res: NowResponse) => {
    const app = await ready;

    app.getHttpAdapter().getInstance().server.emit('request', req, res);
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
