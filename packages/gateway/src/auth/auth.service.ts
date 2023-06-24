import { Injectable } from '@nestjs/common'
import crypto from 'crypto'

import { SurgioService } from '../surgio/surgio.service'

@Injectable()
export class AuthService {
  constructor(private readonly surgioService: SurgioService) {}

  public validateSignedAccessToken(cookie: string): boolean | string {
    const config = this.surgioService.surgioHelper.config
    const needAuth = config?.gateway?.auth
    const accessToken = config?.gateway?.accessToken || ''
    const signedAccessToken = this.sign(accessToken)

    return (
      !needAuth ||
      (needAuth && cookie === signedAccessToken ? accessToken : false)
    )
  }

  public validateAccessToken(tooken: string): boolean | string {
    const config = this.surgioService.surgioHelper.config
    const needAuth = config?.gateway?.auth
    const accessToken = config?.gateway?.accessToken || ''

    return (
      !needAuth || (needAuth && tooken === accessToken ? accessToken : false)
    )
  }

  public validateViewerToken(token: string): boolean | string {
    const config = this.surgioService.surgioHelper.config
    const needAuth = config?.gateway?.auth
    const viewerToken = config?.gateway?.viewerToken || ''

    return (
      !needAuth || (needAuth && token === viewerToken ? viewerToken : false)
    )
  }

  public sign(token: string): string {
    const hash = this.surgioService.surgioHelper.configHash
    const hmac = crypto.createHmac('sha256', hash)

    hmac.update(token)

    return hmac.digest('hex')
  }
}
