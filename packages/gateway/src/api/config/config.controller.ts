import { Controller, Get } from '@nestjs/common'
import _ from 'lodash'
import { packageJson as corePackage } from 'surgio/internal.js'
import gatewayPackage from '../../../package.json' with { type: 'json' }

import { SurgioService } from '../../surgio/surgio.service.js'

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
        backendVersion: gatewayPackage.version,
        coreVersion: corePackage.version as string,
        needAuth:
          this.surgioService.surgioHelper.config?.gateway?.auth ?? false,
      },
    }
  }
}
