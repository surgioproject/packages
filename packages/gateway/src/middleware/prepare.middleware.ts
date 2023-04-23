import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { loadRemoteSnippetList } from 'surgio/build/utils/remote-snippet'

import { SurgioService } from '../surgio/surgio.service'

@Injectable()
export class PrepareMiddleware implements NestMiddleware {
  constructor(private readonly surgioService: SurgioService) {}

  use(req: Response, res: Request, next: () => void): void {
    ;(async () => {
      const surgioHelper = this.surgioService.surgioHelper
      const remoteSnippetsConfig = surgioHelper.config.remoteSnippets || []

      if (!surgioHelper.remoteSnippetList) {
        surgioHelper.remoteSnippetList = await loadRemoteSnippetList(
          remoteSnippetsConfig
        )
      }
    })().then(next)
  }
}
