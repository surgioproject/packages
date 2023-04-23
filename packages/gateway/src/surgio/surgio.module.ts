import { Module, DynamicModule, Global } from '@nestjs/common'
import path from 'path'

import { loadConfig } from 'surgio/build/utils/config'
import { KEY, SurgioHelper } from './surgio-helper'
import { SurgioService } from './surgio.service'

@Global()
@Module({})
export class SurgioModule {
  public static register(options: { readonly cwd: string }): DynamicModule {
    return {
      module: SurgioModule,
      providers: [
        SurgioService,
        {
          provide: KEY,
          useFactory: (): Promise<SurgioHelper> => {
            const configFile = path.join(options.cwd, 'surgio.conf.js')
            const config = loadConfig(options.cwd, configFile)
            const helper = new SurgioHelper(options.cwd, config)

            return helper.init()
          },
        },
      ],
      exports: [SurgioService],
    }
  }
}
