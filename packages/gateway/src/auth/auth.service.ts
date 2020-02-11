import { Injectable } from '@nestjs/common';
import { SurgioService } from '../surgio/surgio.service';

@Injectable()
export class AuthService {
  constructor(private readonly surgioService: SurgioService) {}

  public validateAccessToken(accessToken: string): boolean {
    const config = this.surgioService.surgioHelper.config;
    const needAuth = config?.gateway.auth;

    return !needAuth || (needAuth && accessToken === config.gateway.accessToken);
  }
}
