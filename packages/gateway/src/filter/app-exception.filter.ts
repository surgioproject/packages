import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import Youch from 'youch';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionsFilter.name);

  public catch(exception: HttpException|Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest>();
    let responsePayload;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status);

      this.logger.error(`${request.req.method} ${request.req.url} ${status} "${request.headers['user-agent'] || '-'}"`);

      if (typeof exceptionResponse === 'string') {
        responsePayload = {
          statusCode: status,
          error: exceptionResponse,
        };
      } else {
        responsePayload = exceptionResponse;
      }
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status);

      this.logger.error(`${request.req.method} ${request.req.url} ${status}`);
      this.logger.error(exception.stack || exception);

      responsePayload = {
        statusCode: status,
        error: exception.message || 'Error',
      };
    }

    if (!('accepts' in request)) {
      const res = response as unknown as ServerResponse;

      res.statusCode = responsePayload.statusCode;
      res.end(JSON.stringify(responsePayload));
      return;
    }

    const accepts = request.accepts();

    switch (accepts.type(['json', 'html'])) {
      case 'html': {
        const youch = new Youch(exception, request.req);

        youch
          .addLink(({ message }) => {
            const url = `https://stackoverflow.com/search?q=${encodeURIComponent(`[adonis.js] ${message}`)}`
            return `
<div>
  <p>加入交流群汇报问题：<a href="https://t.me/surgiotg" target="_blank" rel="noopener">https://t.me/surgiotg</a></p>
</div>
            `;
          })
          .toHTML()
          .then(html => {
            response
              .type('text/html')
              .send(html);
          })
          .catch(err => {
            this.logger.error(err.message, err.context);
          });
        break;
      }
      default:
        response.send(JSON.stringify(responsePayload));
    }

  }
}
