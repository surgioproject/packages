import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import _ from 'lodash'
import { formatSubscriptionUserInfo } from 'surgio/utils'

import { APIAuthGuard } from '../auth/api-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../constants/role'
import { SurgioService } from '../surgio/surgio.service'

@Controller('api')
@UseGuards(APIAuthGuard)
export class ApiController {
  constructor(private readonly surgioService: SurgioService) {}

  @Post('/clean-cache')
  @Roles(Role.ADMIN)
  public async cleanCache(): Promise<any> {
    await this.surgioService.surgioHelper.cleanCache()

    return {
      status: 'ok',
    }
  }

  @Get('/artifacts')
  @Roles(Role.ADMIN)
  public async listArtifacts(): Promise<any> {
    const artifactList = this.surgioService.surgioHelper.artifactList

    return {
      status: 'ok',
      data: artifactList,
    }
  }

  @Get('/artifacts/:name')
  @Roles(Role.VIEWER)
  public async getArtifact(
    @Res() res: Response,
    @Param() params
  ): Promise<void> {
    const artifactList = this.surgioService.surgioHelper.artifactList.filter(
      (item) => item.name === params.name
    )

    if (artifactList.length) {
      res.send({
        status: 'ok',
        data: artifactList[0],
      })
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND)
    }
  }

  @Get('/providers')
  @Roles(Role.ADMIN)
  public async listProviders(): Promise<any> {
    const providerList = this.surgioService.listProviders()

    return {
      status: 'ok',
      data: providerList.map((provider) =>
        _.pick(provider, [
          'name',
          'type',
          'url',
          'supportGetSubscriptionUserInfo',
        ])
      ),
    }
  }

  @Get('/providers/:name/subscription')
  @Roles(Role.ADMIN)
  public async getProviderSubscription(@Param() params): Promise<any> {
    const provider = this.surgioService.surgioHelper.providerMap.get(
      params.name
    )

    if (!provider) {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND)
    }

    if (!provider.supportGetSubscriptionUserInfo) {
      throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST)
    }

    const res = await provider.getSubscriptionUserInfo()

    return {
      status: 'ok',
      data: res ? formatSubscriptionUserInfo(res) : null,
    }
  }
}
