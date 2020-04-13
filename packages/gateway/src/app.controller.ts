import { Controller, Get, Res, Param, Query, HttpException, HttpStatus, UseGuards, Req, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { Artifact } from 'surgio/build/generator/artifact';
import _ from 'lodash';
import { URL } from 'url';

import { BearerAuthGuard } from './auth/bearer.guard';
import { SurgioService } from './surgio/surgio.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly surgioService: SurgioService) {}

  @UseGuards(BearerAuthGuard)
  @Get('/get-artifact/:name')
  public async getArtifact(
    @Res() res: FastifyReply<ServerResponse>,
    @Param() params,
    @Query() query: GetArtifactQuery,
    @Req() req: FastifyRequest
  ): Promise<void> {
    const dl = query.dl;
    const format = query.format;
    const filter = query.filter;
    const urlParams = _.omit(query, ['dl', 'format', 'filter', 'access_token']);
    const artifactName: string = params.name;
    const artifact = format !== void 0 ?
      await this.surgioService.transformArtifact(artifactName, format, filter) :
      await this.surgioService.getArtifact(artifactName);

    if (artifact) {
      res.header('content-type', 'text/plain; charset=utf-8');
      res.header('cache-control', 'private, no-cache, no-stores');

      if (dl === '1') {
        res.header('content-disposition', `attachment; filename="${artifactName}"`);
      }

      this.logger.warn(`[download-artifact] ${artifactName} ${req.headers['user-agent'] || '-'}`);

      // @ts-ignore
      await this.sendPayload(req, res, artifact, urlParams);
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Get('/export-providers')
  public async exportProvider(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply<ServerResponse>,
    @Query() query: ExportProviderQuery,
  ): Promise<void> {
    const providers: string[] = query.providers ? query.providers.split(',').map(item => item.trim()) : [];

    if (!providers.length) {
      throw new HttpException('参数 provider 必须指定至少一个值', HttpStatus.BAD_REQUEST);
    }

    providers.forEach(provider => {
      if (!this.surgioService.surgioHelper.providerMap.has(provider)) {
        throw new HttpException(`provider ${provider} 不存在`, HttpStatus.NOT_FOUND);
      }
    });

    const format = query.format;
    const template = query.template;

    if (!format && !template) {
      throw new HttpException('参数 format 和 template 必须指定至少一个值', HttpStatus.BAD_REQUEST);
    }

    const dl = query.dl;
    const filter = query.filter;
    const urlParams = _.omit(query, ['dl', 'format', 'filter', 'access_token', 'providers']);
    let artifact: Artifact;

    if (format) {
      artifact = await this.surgioService.exportProvider(providers[0], format, undefined, {
        filter,
        ...(providers.length > 1 ? {
          combineProviders: providers.splice(1),
        } : null),
      });
    } else {
      artifact = await this.surgioService.exportProvider(providers[0], undefined, template, {
        filter,
        downloadUrl: (new URL(req.req.url as string, this.surgioService.config.publicUrl)).toString(),
        ...(providers.length > 1 ? {
          combineProviders: providers.splice(1),
        } : null),
      });
    }

    if (artifact) {
      res.header('content-type', 'text/plain; charset=utf-8');
      res.header('cache-control', 'private, no-cache, no-stores');

      if (dl === '1') {
        res.header('content-disposition', `attachment; filename="${artifact.artifact.name}"`);
      }

      this.logger.warn(`[download-artifact] ${artifact.artifact.name} ${req.headers['user-agent'] || '-'}`);

      // @ts-ignore
      await this.sendPayload(req, res, artifact, urlParams);
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  private async sendPayload(
    req: FastifyRequest,
    res: FastifyReply<ServerResponse>,
    artifact: string|Artifact,
    urlParams?: Record<string, string>,
  ): Promise<void> {
    if (typeof artifact === 'string') {
      res.send(artifact);
    } else {
      // 只支持输出单个 Provider 的流量信息
      if (artifact.providerMap.size === 1) {
        const providers = artifact.providerMap.values();
        const provider = providers.next().value;

        if (provider.supportGetSubscriptionUserInfo) {
          const subscriptionUserInfo = await provider.getSubscriptionUserInfo();

          if (subscriptionUserInfo) {
            const values = ['upload', 'download', 'total', 'expire']
              .map(key => `${key}=${subscriptionUserInfo[key] || 0}`);

            res.header(
              'subscription-userinfo',
              values.join('; ')
            );
          }
        }
      }

      res.send(artifact.render(
        undefined,
        {
          urlParams: urlParams ? this.processUrlParams(urlParams) : undefined,
        })
      );
    }
  }

  private processUrlParams(urlParams: Record<string, string>): object {
    const result: NonNullable<any> = Object.create(null);

    Object.keys(urlParams)
      .forEach(key => {
        _.set(result, key, urlParams[key]);
      });

    return result;
  }
}

interface GetArtifactQuery {
  readonly format: string;
  readonly filter?: string;
  readonly dl?: string;
  readonly access_token?: string;
  readonly [key: string]: string|undefined;
}

interface ExportProviderQuery {
  readonly providers: string;
  readonly format?: string;
  readonly template?: string;
  readonly filter?: string;
  readonly dl?: string;
  readonly access_token?: string;
  readonly [key: string]: string|undefined;
}
