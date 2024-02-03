import {
  Controller,
  Get,
  Res,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import _ from 'lodash'
import { Artifact } from 'surgio/generator'
import { getUrl, toMD5, getRenderedArtifactCacheMaxage } from 'surgio/utils'
import { unifiedCache } from 'surgio/internal'
import { CACHE_KEYS } from 'surgio/constant'
import { URL } from 'url'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import { APIAuthGuard } from './auth/api-auth.guard'
import { Roles } from './auth/roles.decorator'
import { Role } from './constants/role'
import { SurgioService } from './surgio/surgio.service'
import { PossibleProviderType } from 'surgio/provider'

dayjs.extend(duration)

@Controller()
@UseGuards(APIAuthGuard)
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly surgioService: SurgioService) {}

  @Get('/get-artifact/:name')
  @Roles(Role.VIEWER)
  public async getArtifact(
    @Res() res: Response,
    @Param() params: { readonly name: string },
    @Query() query: GetArtifactQuery,
    @Req() req: Request
  ): Promise<void> {
    const dl = query.dl
    const format = query.format
    const filter = query.filter
    const urlParams = _.omit(query, ['dl', 'format', 'filter', 'access_token'])
    const artifactName: string = params.name
    const userAgent = req.headers['user-agent']
    const getNodeListParams = {
      ...urlParams,
      ...(userAgent ? { requestUserAgent: userAgent } : null),
    }
    const cacheKey = `${CACHE_KEYS.RenderedArtifact}:${toMD5(req.url)}`
    let artifact: string | undefined | Artifact
    let isCache = false

    try {
      artifact =
        format !== void 0
          ? await this.surgioService.transformArtifact(artifactName, format, {
              filter,
              getNodeListParams,
            })
          : await this.surgioService.getArtifact(artifactName, {
              downloadUrl: new URL(
                req.url,
                this.surgioService.config.publicUrl
              ).toString(),
              getNodeListParams,
            })
    } catch (err) {
      const cached = await unifiedCache.get<string>(cacheKey)

      if (cached) {
        isCache = true
        artifact = cached

        this.logger.warn('Artifact 生成错误，使用缓存')
        this.logger.warn(err.stack || err)
      } else {
        throw err
      }
    }

    if (typeof artifact !== 'undefined') {
      res.header('content-type', 'text/plain; charset=utf-8')
      res.header('cache-control', 'private, no-cache, no-stores')

      if (dl === '1') {
        res.header(
          'content-disposition',
          `attachment; filename="${artifactName}"`
        )
      }

      this.logger.warn(
        `[download-artifact] ${artifactName} "${userAgent || '-'}"`
      )

      await this.sendPayload(
        req,
        res,
        artifact,
        {
          ...urlParams,
          ...(userAgent ? { userAgent } : null),
        },
        isCache
      )
    } else {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND)
    }
  }

  @Get('/export-providers')
  @Roles(Role.VIEWER)
  public async exportProvider(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ExportProviderQuery
  ): Promise<void> {
    const providers: string[] = query.providers
      ? query.providers.split(',').map((item) => item.trim())
      : []
    const userAgent = req.headers['user-agent']
    const cacheKey = `${CACHE_KEYS.RenderedArtifact}:${toMD5(req.url)}`

    if (!providers.length) {
      throw new HttpException(
        '参数 provider 必须指定至少一个值',
        HttpStatus.BAD_REQUEST
      )
    }

    providers.forEach((provider) => {
      if (!this.surgioService.surgioHelper.providerMap.has(provider)) {
        throw new HttpException(
          `provider ${provider} 不存在`,
          HttpStatus.NOT_FOUND
        )
      }
    })

    const format = query.format
    const template = query.template

    if (!format && !template) {
      throw new HttpException(
        '参数 format 和 template 必须指定至少一个值',
        HttpStatus.BAD_REQUEST
      )
    }

    const dl = query.dl
    const filter = query.filter
    const urlParams = _.omit(query, [
      'dl',
      'format',
      'template',
      'filter',
      'access_token',
      'providers',
    ])
    const getNodeListParams = {
      ...urlParams,
      ...(userAgent ? { requestUserAgent: userAgent } : null),
    }
    let artifact: Artifact | string
    let isCache = false

    try {
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
            getNodeListParams,
          }
        )
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
            getNodeListParams,
          }
        )
      }
    } catch (err) {
      const cached = await unifiedCache.get<string>(cacheKey)

      if (cached) {
        isCache = true
        artifact = cached

        this.logger.warn('Provider 导出错误，使用缓存')
        this.logger.warn(err.stack || err)
      } else {
        throw err
      }
    }

    if (artifact instanceof Artifact) {
      res.header('content-type', 'text/plain; charset=utf-8')
      res.header('cache-control', 'private, no-cache, no-stores')

      if (dl === '1') {
        res.header(
          'content-disposition',
          `attachment; filename="${artifact.artifact.name}"`
        )
      }

      this.logger.warn(
        `[download-artifact] ${artifact.artifact.name} "${userAgent || '-'}"`
      )

      await this.sendPayload(
        req,
        res,
        artifact,
        {
          ...urlParams,
          ...(userAgent ? { userAgent } : null),
        },
        isCache
      )
    } else {
      await this.sendPayload(req, res, artifact, undefined, isCache)
    }
  }

  @Get('/render')
  @Roles(Role.VIEWER)
  public async renderTemplate(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: RenderTemplateQuery
  ): Promise<void> {
    const { template } = query
    const config = this.surgioService.config
    const gatewayConfig = config?.gateway
    const gatewayHasToken = !!gatewayConfig?.accessToken

    if (!template) {
      throw new HttpException(
        '参数 template 必须指定一个值',
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      res.header('content-type', 'text/plain; charset=utf-8')
      res.header(
        'cache-control',
        `s-maxage=${60 * 60 * 24}, stale-while-revalidate`
      )

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
      )

      res.send(html)
    } catch (err) {
      if (err.message.includes('template not found')) {
        throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND)
      } else {
        throw err
      }
    }
  }

  private async sendPayload(
    req: Request,
    res: Response,
    artifact: string | Artifact,
    customParams?: Record<string, string>,
    isCachedPayload?: boolean
  ): Promise<void> {
    const config = this.surgioService.config
    const gatewayConfig = config?.gateway
    const cacheKey = `${CACHE_KEYS.RenderedArtifact}:${toMD5(req.url)}`

    if (typeof artifact === 'string') {
      if (gatewayConfig?.useCacheOnError && !isCachedPayload) {
        await unifiedCache.set(
          cacheKey,
          artifact,
          getRenderedArtifactCacheMaxage()
        )
      }

      if (isCachedPayload) {
        res.header('x-use-cache', 'true')
      }

      res.send(artifact)
    } else {
      if (!isCachedPayload) {
        const providers = artifact.providerMap.values()
        let provider: PossibleProviderType | undefined = undefined

        if (artifact.artifact.subscriptionUserInfoProvider) {
          for (const p of providers) {
            if (
              p.supportGetSubscriptionUserInfo &&
              p.name === artifact.artifact.subscriptionUserInfoProvider
            ) {
              provider = p
              break
            }
          }
          if (!provider) {
            this.logger.error(`subscriptionUserInfoProvider ${provider} 不存在`)
          }
        } else if (artifact.providerMap.size === 1) {
          provider = providers.next().value
        }

        if (provider) {
          const requestUserAgent = this.surgioService.config.gateway
            ?.passRequestUserAgent
            ? customParams?.requestUserAgent
            : undefined

          if (provider.supportGetSubscriptionUserInfo) {
            try {
              const subscriptionUserInfo =
                await provider.getSubscriptionUserInfo({ requestUserAgent })

              if (subscriptionUserInfo) {
                const values = ['upload', 'download', 'total', 'expire'].map(
                  (key) => `${key}=${subscriptionUserInfo[key] || 0}`
                )

                res.header('subscription-userinfo', values.join('; '))
              }
            } catch (err) {
              this.logger.error('处理订阅信息失败')
              this.logger.error(err.stack || err)
            }
          }
        }
      }

      const body = artifact.render(undefined, {
        ...(customParams ? this.processUrlParams(customParams) : undefined),
      })

      if (gatewayConfig?.useCacheOnError && !isCachedPayload) {
        await unifiedCache.set(cacheKey, body, getRenderedArtifactCacheMaxage())
      }

      if (isCachedPayload) {
        res.header('x-use-cache', 'true')
      }

      res.send(body)
    }
  }

  private processUrlParams(
    customParams: Record<string, string>
  ): Record<string, string> {
    const result: NonNullable<any> = Object.create(null)

    Object.keys(customParams).forEach((key) => {
      _.set(result, key, customParams[key])
    })

    return result
  }
}

interface GetArtifactQuery {
  readonly format: string
  readonly filter?: string
  readonly dl?: string
  readonly access_token?: string
  readonly [key: string]: string | undefined
}

interface RenderTemplateQuery {
  readonly template: string
}

interface ExportProviderQuery {
  readonly providers: string
  readonly format?: string
  readonly template?: string
  readonly filter?: string
  readonly dl?: string
  readonly access_token?: string
  readonly [key: string]: string | undefined
}
