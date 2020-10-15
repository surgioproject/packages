import 'source-map-support/register';
import { ConfigService } from '@nestjs/config';
import { NowRequest, NowResponse } from '@vercel/node/dist';
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

// export const createAwsHandler = (): ((event: any, context: Context) => void) => {
//   let lambdaProxy: Server;
//   const prepare = bootstrap()
//     .then(nestApp => {
//       return nestApp.init();
//     });
//
//   return (event: any, context: Context) => {
//     if (!lambdaProxy) {
//       prepare.then((nestApp) => {
//         lambdaProxy = nestApp.getHttpServer();
//         serverlessExpress.proxy(lambdaProxy, event, context);
//       });
//     } else {
//       serverlessExpress.proxy(lambdaProxy, event, context);
//     }
//   };
// };
//
// export const createServerlessHanlder = () => {
//   let lambdaProxy: ServerlessHandler;
//   const prepare = bootstrap()
//     .then(nestApp => {
//       return nestApp.init();
//     });
//
//   return async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
//     if (!lambdaProxy) {
//       const nestApp = await prepare;
//       lambdaProxy = serverless(nestApp.getHttpServer());
//       return await lambdaProxy(event, context);
//     } else {
//       return await lambdaProxy(event, context);
//     }
//   };
// };

export const bootstrapServer = bootstrap;
