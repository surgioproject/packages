import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionsFilter.name);

  public catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const payload = {
        path: request.req.url,
        message: '',
      };

      this.logger.error(`${request.req.method} ${request.req.url} ${status} "${request.headers['user-agent'] || '-'}"`);

      response.status(status);

      if (typeof exceptionResponse === 'string') {
        response
          .status(status)
          .send({
            message: exceptionResponse,
            path: request.req.url,
          });
      } else {
        response
          .status(status)
          .send({
            ...payload,
            path: request.req.url,
          });
      }
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      this.logger.error(`${request.req.method} ${request.req.url} ${status}`);
      this.logger.error(exception.stack || exception);

      response
        .status(status)
        .send({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.req.url,
        });
    }
  }
}
