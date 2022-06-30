import { Controller, Get } from '@nestjs/common';
import { pkg as corePkgFile } from 'surgio';
import _ from 'lodash';

import { SurgioService } from '../../surgio/surgio.service';

@Controller('api')
export class ConfigController {
  constructor(private readonly surgioService: SurgioService) {}

  @Get('/config')
  public async config(): Promise<any> {
    return {
      status: 'ok',
      data: {
        ..._.pick(this.surgioService.surgioHelper.config, [
          'urlBase',
          'publicUrl',
        ]),
        backendVersion: require('../../../package.json').version,
        coreVersion: corePkgFile.version as string,
        needAuth:
          this.surgioService.surgioHelper.config?.gateway?.auth ?? false,
      },
    };
  }
}
