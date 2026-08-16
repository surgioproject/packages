import os from 'os'
import { basename, join } from 'path'
import fs from 'fs-extra'
import { Environment } from 'nunjucks'
import { Logger } from '@nestjs/common'
import { createHash } from 'crypto'
import { createRequire } from 'node:module'
import { TMP_FOLDER_NAME } from 'surgio/constant.js'
import { getEngine } from 'surgio/generator.js'
import {
  cleanCaches,
  type ArtifactConfig,
  type CommandConfig,
  type RemoteSnippet,
} from 'surgio/internal.js'
import { getProvider, type PossibleProviderType } from 'surgio/provider.js'

const requireModule = createRequire(import.meta.url)

export const KEY = 'SURGIO_HELPER'

export class SurgioHelper {
  public remoteSnippetList?: ReadonlyArray<RemoteSnippet>
  public artifactList: ReadonlyArray<ArtifactConfig>
  public providerMap: Map<string, PossibleProviderType> = new Map()
  public readonly templateEngine: Environment
  public readonly configHash: string

  constructor(
    public cwd: string,
    public readonly config: CommandConfig
  ) {
    this.artifactList = config.artifacts
    this.templateEngine = getEngine(config.templateDir, {
      clashCore: config.clashConfig?.clashCore,
    })
    this.configHash = this.getConfigSHA256Hash()
  }

  public async init(): Promise<this> {
    await this.readProviders()

    return this
  }

  private async readProviders(): Promise<void> {
    const files = await fs.readdir(this.config.providerDir, {
      encoding: 'utf8',
    })

    async function readProvider(
      path: string
    ): Promise<PossibleProviderType | undefined> {
      const provider = await (() => {
        try {
          if (!path.endsWith('.js')) {
            return undefined
          }

          const providerName = basename(path, '.js')

          return getProvider(providerName, requireModule(path))
        } catch (err) {
          Logger.error(`读取 Provider (${path}) 失败: ` + err.message)
          return undefined
        }
      })()

      if (!provider?.type) {
        return undefined
      }

      return provider
    }

    for (const file of files) {
      const result = await readProvider(join(this.config.providerDir, file))
      if (result) {
        this.providerMap.set(result.name, result)
      }
    }
  }

  private getConfigSHA256Hash(): string {
    return createHash('sha256')
      .update(JSON.stringify(this.config))
      .digest('hex')
  }

  public async cleanCache(): Promise<void> {
    const tmpDir = join(os.tmpdir(), TMP_FOLDER_NAME)

    if (this.remoteSnippetList) {
      Logger.log('已清除远程片段')
      this.remoteSnippetList = undefined
    }

    if (fs.existsSync(tmpDir)) {
      Logger.log('已清除文件缓存')
      await fs.remove(tmpDir)
    }

    await cleanCaches()
    Logger.log('已清除 内存/Redis 缓存')
  }
}
