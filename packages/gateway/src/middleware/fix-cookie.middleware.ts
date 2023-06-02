import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class FixCookieMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction): void {
    res.cookie('_t', '', {
      maxAge: -1,
      httpOnly: true,
      signed: true,
      path: '/api',
    })
    next()
  }
}
