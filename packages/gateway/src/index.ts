import { bootstrap } from './bootstrap';

export const createHttpServer = (): Promise<void> => {
  return bootstrap()
    .catch(err => {
      console.error('⚠️ 服务启动失败');
      console.error(err);
      process.exit(1);
    });
};
