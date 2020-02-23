import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ServerFactoryFunction } from 'fastify';

export interface AdapterOptions {
  readonly serverFactory?: ServerFactoryFunction;
}
export function createAdapter(options: AdapterOptions = {}): FastifyAdapter {
  return new FastifyAdapter({
    serverFactory: options.serverFactory,
    logger: {
      level: 'warn',
      serializers: {
        req(req: any): any {
          return {
            method: req.method,
            url: req.url,
            'user-agent': req.headers['user-agent'] || '-',
            hostname: req.hostname,
            remoteAddress: req.ip,
            remotePort: req.connection.remotePort
          }
        }
      },
      prettyPrint: true,
    },
  });
}
