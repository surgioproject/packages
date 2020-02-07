import { Controller, Get, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import _ from 'lodash';

import { SurgioService } from '../surgio/surgio.service';

@Controller('api')
export class ApiController {
  constructor(private readonly surgioService: SurgioService) {}

  @Get('config')
  public async config(): Promise<any> {
    return {
      status: 'ok',
      data: {
        ..._.pick(this.surgioService.surgioHelper.config, ['urlBase', 'publicUrl']),
        backendVersion: require('../../package.json').version,
        coreVersion: require('surgio/package.json').version,
      },
    };
  }

  @Get('artifacts')
  public async listArtifacts(): Promise<any> {
    const artifactList = this.surgioService.surgioHelper.artifactList;

    return {
      status: 'ok',
      data: artifactList,
    };
  }

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
