import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import Youch from 'youch';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionsFilter.name);

  public catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest>();
    const accepts = request.accepts();
    const isHttpException = exception instanceof HttpException;
    let responsePayload;

    if (isHttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status);

      this.logger.error(`${request.req.method} ${request.req.url} ${status} "${request.headers['user-agent'] || '-'}"`);

      if (typeof exceptionResponse === 'string') {
        responsePayload = {
          statusCode: status,
          message: exceptionResponse,
        };
      } else {
        responsePayload = {
          statusCode: status,
          message: (exceptionResponse as Error)?.message || 'Error',
        };
      }
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status);

      this.logger.error(`${request.req.method} ${request.req.url} ${status}`);
      this.logger.error(exception.stack || exception);

      responsePayload = {
        statusCode: status,
        message: exception.message || 'Error',
        code: exception.code || 'Error',
      };
    }

    switch (accepts.type(['json', 'html'])) {
      case 'html': {
        const youch = new Youch(exception, request.req);

        youch.toHTML()
          .then(html => {
            response
              .type('text/html')
              .send(html);
          })
          .catch(err => {
            response.send(err);
          });
        break;
      }
      default:
        response.send(JSON.stringify(responsePayload));
    }

  }
}
