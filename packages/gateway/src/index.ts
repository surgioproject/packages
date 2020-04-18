import { NowRequest, NowResponse } from '@now/node/dist';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): ((req: NowRequest, res: NowResponse) => Promise<void>) => {
  const prepare = bootstrap()
    .then(nestApp => {
      return nestApp.init()
        .then(() => nestApp.getHttpAdapter().getInstance().ready())
        .then(() => nestApp);
    });

  return async (req: NowRequest, res: NowResponse) => {
    const nestApp = await prepare;
    nestApp.getHttpAdapter().getInstance().server.emit('request', req, res);
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
