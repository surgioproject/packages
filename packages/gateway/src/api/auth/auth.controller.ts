import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import _ from 'lodash'

import { APIAuthGuard } from '../../auth/api-auth.guard'
import { SurgioService } from '../../surgio/surgio.service'
import { EnrichedRequest } from '../../types/app'

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly surgioService: SurgioService,
    private readonly configService: ConfigService
  ) {}

  @Post('/')
  public async login(
    @Req() req: EnrichedRequest,
    @Res() res: Response
  ): Promise<void> {
    const accessToken = req.body.accessToken

    if (
      accessToken ===
      this.surgioService.surgioHelper.config?.gateway?.accessToken
    ) {
      res.cookie('_t', accessToken, {
        maxAge:
          (this.surgioService.surgioHelper.config?.gateway?.cookieMaxAge ??
            (this.configService.get('defaultCookieMaxAge') as number)) * 1e3,
        httpOnly: true,
        signed: true,
        path: '/',
      })
      res.status(200).send({
        status: 'ok',
      })
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
  }

  @Post('/logout')
  public async postLogout(
    @Req() req: EnrichedRequest,
    @Res() res: Response
  ): Promise<void> {
    res.cookie('_t', '', {
      maxAge: -1,
      httpOnly: true,
      signed: true,
      path: '/',
    })
    res.cookie('_t', '', {
      maxAge: -1,
      httpOnly: true,
      signed: true,
      path: '/api',
    })
    res.status(200).send({
      status: 'ok',
    })
  }

  @Get('/logout')
  public async getLogout(
    @Req() req: EnrichedRequest,
    @Res() res: Response
  ): Promise<void> {
    res.cookie('_t', '', {
      maxAge: -1,
      httpOnly: true,
      signed: true,
      path: '/',
    })
    res.cookie('_t', '', {
      maxAge: -1,
      httpOnly: true,
      signed: true,
      path: '/api',
    })
    res.redirect('/auth')
  }

  @UseGuards(APIAuthGuard)
  @Post('/validate-token')
  public async validateToken(
    @Req() req: EnrichedRequest,
    @Res() res: Response
  ): Promise<void> {
    const data = {
      ...req.user,
      viewerToken: this.surgioService.surgioHelper.config?.gateway?.viewerToken,
    }

    if (data.viewerToken) {
      res.status(200).send({
        status: 'ok',
        data: _.omit(data, ['accessToken']),
      })

      return
    }

    res.status(200).send({
      status: 'ok',
      data,
    })
  }

  @UseGuards(APIAuthGuard)
  @Post('/validate-cookie')
  public async validateCookie(
    @Req() req: EnrichedRequest,
    @Res() res: Response
  ): Promise<void> {
    const data = {
      ...req.user,
      viewerToken: this.surgioService.surgioHelper.config?.gateway?.viewerToken,
    }

    if (data.viewerToken) {
      res.status(200).send({
        status: 'ok',
        data: _.omit(data, ['accessToken']),
      })
      return
    }

    res.status(200).send({
      status: 'ok',
      data,
    })
  }
}
