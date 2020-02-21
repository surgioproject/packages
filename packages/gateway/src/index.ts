import http from 'http';
import { bootstrap } from './bootstrap';

export const createHttpServer = (): Promise<http.Server> => {
  return bootstrap()
    .then(app => app.getHttpServer());
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
