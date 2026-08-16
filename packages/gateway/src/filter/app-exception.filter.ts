import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ServerResponse } from 'http'
import { Youch } from 'youch'
import { isSurgioError } from 'surgio/internal.js'

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionsFilter.name)

  public catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    let responsePayload

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      response.status(status)

      this.logger.error(
        `${request.method} ${request.url} ${status} "${
          request.headers['user-agent'] || '-'
        }"`
      )

      if (typeof exceptionResponse === 'string') {
        responsePayload = {
          status: 'error',
          statusCode: status,
          error: exceptionResponse,
        }
      } else {
        responsePayload = {
          status: 'error',
          ...exceptionResponse,
        }
      }
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR

      response.status(status)

      this.logger.error(`${request.method} ${request.url} ${status}`)

      if (isSurgioError(exception)) {
        this.logger.error(exception.format())
      } else {
        this.logger.error(exception.stack || exception)
      }

      responsePayload = {
        status: 'error',
        statusCode: status,
        error: exception.message || 'Error',
      }
    }

    if (!('accepts' in request)) {
      const res = response as unknown as ServerResponse

      res.statusCode = responsePayload.statusCode
      res.end(JSON.stringify(responsePayload))
      return
    }

    const accept = request.accepts('json', 'html')

    if (accept === 'html') {
      const youch = new Youch()
      const surgioMetadata = [
        {
          key: 'Community',
          value: 'https://t.me/surgiotg',
        },
      ]

      if (isSurgioError(exception)) {
        surgioMetadata.unshift({
          key: 'Formatted error',
          value: exception.format(),
        })
      }

      youch.metadata.group('Surgio', { Support: surgioMetadata })
      youch
        .toHTML(exception, {
          request: {
            headers: request.headers,
            method: request.method,
            url: request.originalUrl,
          },
        })
        .then((html) => {
          response.type('text/html').send(html)
        })
        .catch((err) => {
          this.logger.error(err.message, err.context)
        })
    } else {
      response.send(JSON.stringify(responsePayload))
    }
  }
}
