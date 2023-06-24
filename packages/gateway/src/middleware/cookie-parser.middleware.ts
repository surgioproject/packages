import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'

@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
  public static configure(
    secret: string | ReadonlyArray<string>,
    opts?: cookieParser.CookieParseOptions
  ): void {
    this.secret = secret
    if (opts) {
      this.options = opts
    }
  }

  private static secret: string | ReadonlyArray<string>
  private static options: cookieParser.CookieParseOptions

  public use(req: Request, res: Response, next: NextFunction): void {
    if (CookieParserMiddleware.secret) {
      cookieParser(
        CookieParserMiddleware.secret as string | string[],
        CookieParserMiddleware.options
      )(req, res, next)
    } else {
      cookieParser()(req, res, next)
    }
  }
}
