import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ServerFactoryFunction } from 'fastify';

export interface AdapterOptions {
  readonly serverFactory?: ServerFactoryFunction;
}
export function createAdapter(options: AdapterOptions = {}): FastifyAdapter {
  const adapter = new FastifyAdapter({
    serverFactory: options.serverFactory,
    logger: false,
    trustProxy: true,
  });

  return adapter;
}
