import {
  Controller,
  Get,
  Head,
  Res,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Logger,
  All,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Artifact } from 'surgio/build/generator/artifact';
import _ from 'lodash';
import { getUrl } from 'surgio/build/utils';
import { URL } from 'url';
import cors from '@royli/cors-anywhere';

import { BearerAuthGuard } from './auth/bearer.guard';
import { SurgioService } from './surgio/surgio.service';

function parseEnvList(env): ReadonlyArray<string> {
  if (!env) {
    return [];
  }
  return env.split(',');
}

const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
const proxy = cors.createServer({
  originBlacklist,
  originWhitelist,
  removeHeaders: ['cookie', 'cookie2'],
});

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly surgioService: SurgioService) {}

  @UseGuards(BearerAuthGuard)
  @Get('/get-artifact/:name')
  public async getArtifact(
    @Res() res: Response,
    @Param() params: { readonly name: string },
    @Query() query: GetArtifactQuery,
    @Req() req: Request
  ): Promise<void> {
    const dl = query.dl;
    const format = query.format;
    const filter = query.filter;
    const urlParams = _.omit(query, ['dl', 'format', 'filter', 'access_token']);
    const artifactName: string = params.name;
    const artifact =
      format !== void 0
        ? await this.surgioService.transformArtifact(
            artifactName,
            format,
            filter
          )
        : await this.surgioService.getArtifact(
            artifactName,
            new URL(
              req.url as string,
              this.surgioService.config.publicUrl
            ).toString()
          );

    if (typeof artifact !== 'undefined') {
      res.header('content-type', 'text/plain; charset=utf-8');
      res.header('cache-control', 'private, no-cache, no-stores');

      if (dl === '1') {
        res.header(
          'content-disposition',
          `attachment; filename="${artifactName}"`
        );
      }

      this.logger.warn(
        `[download-artifact] ${artifactName} ${
          req.headers['user-agent'] || '-'
        }`
      );

      // @ts-ignore
      await this.sendPayload(req, res, artifact, urlParams);
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Get('/export-providers')
  public async exportProvider(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ExportProviderQuery
  ): Promise<void> {
    const providers: string[] = query.providers
      ? query.providers.split(',').map((item) => item.trim())
      : [];

    if (!providers.length) {
      throw new HttpException(
        '参数 provider 必须指定至少一个值',
        HttpStatus.BAD_REQUEST
      );
    }

    providers.forEach((provider) => {
      if (!this.surgioService.surgioHelper.providerMap.has(provider)) {
        throw new HttpException(
          `provider ${provider} 不存在`,
          HttpStatus.NOT_FOUND
        );
      }
    });

    const format = query.format;
    const template = query.template;

    if (!format && !template) {
      throw new HttpException(
        '参数 format 和 template 必须指定至少一个值',
        HttpStatus.BAD_REQUEST
      );
    }

    const dl = query.dl;
    const filter = query.filter;
    const urlParams = _.omit(query, [
      'dl',
      'format',
      'template',
      'filter',
      'access_token',
      'providers',
    ]);
    let artifact: Artifact;

    if (format) {
      artifact = await this.surgioService.exportProvider(
        providers[0],
        format,
        undefined,
        {
          filter,
          ...(providers.length > 1
            ? {
                combineProviders: providers.splice(1),
              }
            : null),
        }
      );
    } else {
      artifact = await this.surgioService.exportProvider(
        providers[0],
        undefined,
        template,
        {
          filter,
          downloadUrl: new URL(
            req.url as string,
            this.surgioService.config.publicUrl
          ).toString(),
          ...(providers.length > 1
            ? {
                combineProviders: providers.splice(1),
              }
            : null),
        }
      );
    }

    if (artifact) {
      res.header('content-type', 'text/plain; charset=utf-8');
      res.header('cache-control', 'private, no-cache, no-stores');

      if (dl === '1') {
        res.header(
          'content-disposition',
          `attachment; filename="${artifact.artifact.name}"`
        );
      }

      this.logger.warn(
        `[download-artifact] ${artifact.artifact.name} ${
          req.headers['user-agent'] || '-'
        }`
      );

      // @ts-ignore
      await this.sendPayload(req, res, artifact, urlParams);
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Get('/render')
  public async renderTemplate(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: RenderTemplateQuery
  ): Promise<void> {
    const { template } = query;
    const config = this.surgioService.config;
    const gatewayConfig = config?.gateway;
    const gatewayHasToken = !!gatewayConfig?.accessToken;

    if (!template) {
      throw new HttpException(
        '参数 template 必须指定一个值',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      res.header('content-type', 'text/plain; charset=utf-8');
      res.header(
        'cache-control',
        `s-maxage=${60 * 60 * 24}, stale-while-revalidate`
      );

      const html = this.surgioService.surgioHelper.templateEngine.render(
        `${template}.tpl`,
        {
          downloadUrl: new URL(
            req.url as string,
            this.surgioService.config.publicUrl
          ).toString(),
          getUrl: (p: string) =>
            getUrl(
              config.publicUrl,
              p,
              gatewayHasToken ? gatewayConfig?.accessToken : undefined
            ),
        }
      );

      res.send(html);
    } catch (err) {
      if (err.message.includes('template not found')) {
        throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
      } else {
        throw err;
      }
    }
  }

  @All('/proxy')
  public async proxy(
    @Req() req: IncomingMessage,
    @Res() res: ServerResponse
  ): Promise<void> {
    if (!req.url) {
      throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
    } else {
      req.url = req.url
        .replace(/^(\/proxy)?\/https:\/{1,2}(.*)/, '/https://$2')
        .replace(/^(\/proxy)?\/http:\/{1,2}(.*)/, '/http://$2');
      proxy.emit('request', req, res);
    }
  }

  private async sendPayload(
    req: Request,
    res: Response,
    artifact: string | Artifact,
    urlParams?: Record<string, string>
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
            const values = ['upload', 'download', 'total', 'expire'].map(
              (key) => `${key}=${subscriptionUserInfo[key] || 0}`
            );

            res.header('subscription-userinfo', values.join('; '));
          }
        }
      }

      res.send(
        artifact.render(undefined, {
          urlParams: urlParams ? this.processUrlParams(urlParams) : undefined,
        })
      );
    }
  }

  private processUrlParams(
    urlParams: Record<string, string>
  ): Record<string, string> {
    const result: NonNullable<any> = Object.create(null);

    Object.keys(urlParams).forEach((key) => {
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
  readonly [key: string]: string | undefined;
}

interface RenderTemplateQuery {
  readonly template: string;
}

interface ExportProviderQuery {
  readonly providers: string;
  readonly format?: string;
  readonly template?: string;
  readonly filter?: string;
  readonly dl?: string;
  readonly access_token?: string;
  readonly [key: string]: string | undefined;
}
