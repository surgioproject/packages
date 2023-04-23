import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Artifact } from 'surgio/build/generator/artifact'
import { PossibleProviderType } from 'surgio/build/provider'
import { CommandConfig } from 'surgio/build/types'

import { KEY, SurgioHelper } from './surgio-helper'

@Injectable()
export class SurgioService {
  constructor(@Inject(KEY) public surgioHelper: SurgioHelper) {}

  public get config(): CommandConfig {
    return this.surgioHelper.config
  }

  public async getArtifact(
    artifactName: string,
    {
      downloadUrl,
    }: {
      downloadUrl?: string
    } = {}
  ): Promise<Artifact | undefined> {
    const target = this.surgioHelper.artifactList.find(
      (item) => item.name === artifactName
    )

    if (!target) {
      return undefined
    }

    const artifactInstance = new Artifact(
      this.surgioHelper.config,
      {
        ...target,
        downloadUrl,
      },
      {
        remoteSnippetList: this.surgioHelper.remoteSnippetList,
        templateEngine: this.surgioHelper.templateEngine,
      }
    )

    await artifactInstance.init()

    return artifactInstance
  }

  public async exportProvider(
    providerName: string,
    format: string | undefined,
    template: string | undefined,
    options: ExportProviderOptions = {}
  ): Promise<Artifact> {
    const artifactConfig = format
      ? {
          name: `${providerName}.conf`,
          provider: providerName,
          template: undefined,
          templateString: this.getTemplateByFormat(
            format,
            options.filter,
            providerName
          ),
          ...(options.combineProviders
            ? {
                combineProviders: options.combineProviders,
              }
            : null),
        }
      : template
      ? {
          name: `${providerName}.conf`,
          downloadUrl: options.downloadUrl,
          provider: providerName,
          template,
          ...(options.combineProviders
            ? {
                combineProviders: options.combineProviders,
              }
            : null),
        }
      : (() => {
          throw new Error('未指定 format 和 template')
        })()

    const artifactInstance = new Artifact(
      this.surgioHelper.config,
      artifactConfig,
      {
        remoteSnippetList: this.surgioHelper.remoteSnippetList || [],
        templateEngine: this.surgioHelper.templateEngine,
      }
    )

    await artifactInstance.init()

    return artifactInstance
  }

  public async transformArtifact(
    artifactName: string,
    format: string,
    filter?: string
  ): Promise<Artifact | string | undefined> {
    const target = this.surgioHelper.artifactList.find(
      (item) => item.name === artifactName
    )

    if (!target) {
      return undefined
    }

    const artifact = {
      ...target,
      template: undefined,
      templateString: this.getTemplateByFormat(format, filter, target.provider),
    }
    const artifactInstance = new Artifact(this.surgioHelper.config, artifact, {
      remoteSnippetList: this.surgioHelper.remoteSnippetList || [],
      templateEngine: this.surgioHelper.templateEngine,
    })

    await artifactInstance.init()

    return artifactInstance.render()
  }

  public listProviders(): ReadonlyArray<PossibleProviderType> {
    return Array.from(this.surgioHelper.providerMap.values())
  }

  public getTemplateByFormat(
    format: string,
    filter?: string,
    providerName?: string
  ): string {
    switch (format) {
      case 'surge-policy':
        return `{{ getSurgeNodes(nodeList${filter ? `, ${filter}` : ''}) }}`

      case 'qx-server':
        return `{{ getQuantumultXNodes(nodeList${
          filter ? `, ${filter}` : ''
        }) }}`

      case 'clash-provider':
        return [
          '---',
          `{{ {proxies: getClashNodes(nodeList${
            filter ? `, ${filter}` : ''
          })} | yaml }}`,
          '',
        ].join('\n')

      case 'ss':
        return `{{ getShadowsocksNodes(nodeList, ${JSON.stringify(
          providerName || 'Surgio'
        )}) | base64 }}`

      case 'ssr':
        return `{{ getShadowsocksrNodes(nodeList, ${JSON.stringify(
          providerName || 'Surgio'
        )}) | base64 }}`

      case 'v2ray':
        return `{{ getV2rayNNodes(nodeList) | base64 }}`

      default:
        throw new HttpException(
          '参数 format 不存在或不正确',
          HttpStatus.BAD_REQUEST
        )
    }
  }
}

export interface ExportProviderOptions {
  readonly downloadUrl?: string
  readonly filter?: string
  readonly combineProviders?: ReadonlyArray<string>
}
