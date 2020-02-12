import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const json = exception.getResponse();

    request.log.warn('[request] [%s] %s %s %s "%s"', request.ip, request.req.method, status, request.req.url, request.headers['user-agent'] || '-');

    response
      .status(status)
      .send({
        ...json as object,
        path: request.req.url,
      });
  }
}
