import { Controller, Get, HttpException, HttpStatus, Param, Post, Res, UseGuards, Req } from '@nestjs/common';
import _ from 'lodash';

import { CookieAuthGuard } from '../auth/cookie.guard';
import { SurgioService } from '../surgio/surgio.service';

@Controller('api')
export class ApiController {
  constructor(private readonly surgioService: SurgioService) {}

  @Post('/auth')
  public async login(@Req() req, @Res() res): Promise<void> {
    const accessToken = req.body.accessToken;

    if (accessToken === this.surgioService.surgioHelper.config?.gateway.accessToken) {
      res.setCookie('_t', accessToken, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        signed: true,
      });
      res.send({
        status: 'ok',
      });
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(CookieAuthGuard)
  @Get('/auth/validate')
  public async validateAuth(@Req() req): Promise<any> {
    return {
      status: 'ok',
      data: req.user,
    };
  }

  @Get('config')
  public async config(@Req() req): Promise<any> {
    return {
      status: 'ok',
      data: {
        ..._.pick(this.surgioService.surgioHelper.config, ['urlBase', 'publicUrl']),
        backendVersion: require('../../package.json').version,
        coreVersion: require('surgio/package.json').version,
        needAuth: this.surgioService.surgioHelper.config?.gateway?.auth ?? false,
      },
    };
  }

  @UseGuards(CookieAuthGuard)
  @Get('artifacts')
  public async listArtifacts(): Promise<any> {
    const artifactList = this.surgioService.surgioHelper.artifactList;

    return {
      status: 'ok',
      data: artifactList,
    };
  }

  @UseGuards(CookieAuthGuard)
  @Get('artifacts/:name')
  public async getArtifact(@Res() res, @Param() params): Promise<void> {
    const artifactList = this.surgioService.surgioHelper.artifactList.filter(item => item.name === params.name);

    if (artifactList.length) {
      res.send({
        status: 'ok',
        data: artifactList[0],
      })
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }
}
