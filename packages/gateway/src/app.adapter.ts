import { FastifyAdapter } from '@nestjs/platform-fastify';

const fastifyAdapter = new FastifyAdapter({
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

export default fastifyAdapter;
