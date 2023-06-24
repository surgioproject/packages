import { Module, DynamicModule, Global } from '@nestjs/common'
import { loadConfig } from 'surgio/config'

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
            const config = loadConfig(options.cwd)
            const helper = new SurgioHelper(options.cwd, config)

            return helper.init()
          },
        },
      ],
      exports: [SurgioService],
    }
  }
}
