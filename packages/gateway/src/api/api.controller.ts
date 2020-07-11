import { Controller, Get, HttpException, HttpStatus, Param, Post, Res, UseGuards, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import _ from 'lodash';
import { formatSubscriptionUserInfo } from 'surgio/build/utils/subscription';

import { BearerAuthGuard } from '../auth/bearer.guard';
import { CookieAuthGuard } from '../auth/cookie.guard';
import { SurgioService } from '../surgio/surgio.service';

@Controller('api')
export class ApiController {
  constructor(
    private readonly surgioService: SurgioService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/auth')
  public async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const accessToken = req.body.accessToken;

    if (accessToken === this.surgioService.surgioHelper.config?.gateway?.accessToken) {
      res.cookie('_t', accessToken, {
        maxAge: this.surgioService.surgioHelper.config?.gateway?.cookieMaxAge
          ?? this.configService.get('defaultCookieMaxAge'),
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

  @UseGuards(BearerAuthGuard)
  @Get('/auth/validate-token')
  public async validateToken(@Req() req: Request): Promise<any> {
    return {
      status: 'ok',
      data: req.user,
    };
  }

  @UseGuards(CookieAuthGuard)
  @Get('/auth/validate-cookie')
  public async validateCookie(@Req() req: Request): Promise<any> {
    return {
      status: 'ok',
      data: req.user,
    };
  }

  @Get('/config')
  public async config(@Req() req: Request): Promise<any> {
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

  @UseGuards(BearerAuthGuard)
  @Get('/artifacts')
  public async listArtifacts(): Promise<any> {
    const artifactList = this.surgioService.surgioHelper.artifactList;

    return {
      status: 'ok',
      data: artifactList,
    };
  }

  @UseGuards(BearerAuthGuard)
  @Get('/artifacts/:name')
  public async getArtifact(@Res() res: Response, @Param() params): Promise<void> {
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

  @UseGuards(BearerAuthGuard)
  @Get('/providers')
  public async listProviders(): Promise<any> {
    const providerList = this.surgioService.listProviders();

    return {
      status: 'ok',
      data: providerList.map(provider => _.pick(provider, ['name', 'type', 'url', 'supportGetSubscriptionUserInfo'])),
    };
  }

  @UseGuards(BearerAuthGuard)
  @Get('/providers/:name/subscription')
  public async getProviderSubscription(@Param() params): Promise<any> {
    const provider = this.surgioService.surgioHelper.providerMap.get(params.name);

    if (!provider) {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }

    if (!provider.supportGetSubscriptionUserInfo) {
      throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
    }

    const res = await provider.getSubscriptionUserInfo();

    return {
      status: 'ok',
      data: res ? formatSubscriptionUserInfo(res) : null,
    };
  }

  @Get('*')
  public async apiNotFound(): Promise<void> {
    throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
  }
}
