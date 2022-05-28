import os from 'os';
import { basename, join } from 'path';
import fs from 'fs-extra';
import { TMP_FOLDER_NAME } from 'surgio/build/utils/constant';
import { Environment } from 'nunjucks';
import semver from 'semver';
import { Logger } from '@nestjs/common';
import { getEngine } from 'surgio/build/generator/template';
import { getProvider, PossibleProviderType } from 'surgio/build/provider';
import {
  ArtifactConfig,
  CommandConfig,
  RemoteSnippet,
} from 'surgio/build/types';
import { PackageJson } from 'type-fest';
import { pkg as corePkgFile, caches as coreCaches } from 'surgio';

export class SurgioHelper {
  public remoteSnippetList?: ReadonlyArray<RemoteSnippet>;
  public artifactList: ReadonlyArray<ArtifactConfig>;
  public providerMap: Map<string, PossibleProviderType> = new Map();
  public readonly templateEngine: Environment;

  private readonly pkgFile?: PackageJson;

  constructor(public cwd: string, public readonly config: CommandConfig) {
    const pkgFile = join(cwd, 'package.json');

    this.artifactList = config.artifacts;
    this.templateEngine = getEngine(config.templateDir);
    if (fs.existsSync(pkgFile)) {
      this.pkgFile = require(pkgFile);
    }
  }

  public async init(): Promise<this> {
    await this.checkCoreVersion();
    await this.readProviders();

    return this;
  }

  private async readProviders(): Promise<void> {
    const files = await fs.readdir(this.config.providerDir, {
      encoding: 'utf8',
    });

    async function readProvider(
      path
    ): Promise<PossibleProviderType | undefined> {
      let provider;

      try {
        const providerName = basename(path, '.js');

        provider = await getProvider(providerName, require(path));
      } catch (err) {
        return undefined;
      }

      if (!provider?.type) {
        return undefined;
      }

      return provider;
    }

    for (const file of files) {
      const result = await readProvider(join(this.config.providerDir, file));
      if (result) {
        this.providerMap.set(result.name, result);
      }
    }
  }

  private async checkCoreVersion(): Promise<void> {
    const gatewayPkgFile = require('../../package.json');
    const peerVersion = gatewayPkgFile.peerDependencies.surgio;
    const corePkgVersion = corePkgFile.version as string;

    // Pre-release doesn't need to check
    if (corePkgVersion.includes('-')) {
      return;
    }

    if (!semver.satisfies(corePkgVersion, peerVersion)) {
      Logger.warn('', undefined, false);
      Logger.warn(
        'Surgio 版本过低，请运行下面命令升级后重新运行！',
        undefined,
        false
      );
      Logger.warn(
        `要求版本 ${peerVersion}，当前版本 ${corePkgFile.version}`,
        undefined,
        false
      );
      Logger.warn('', undefined, false);
      Logger.warn('  命令：', undefined, false);
      Logger.warn('  npm install surgio@latest', undefined, false);
      Logger.warn('', undefined, false);
      throw new Error('Surgio 版本过低');
    }
  }

  public async cleanCache(): Promise<void> {
    const tmpDir = join(os.tmpdir(), TMP_FOLDER_NAME);

    if (this.remoteSnippetList) {
      Logger.log('已清除远程片段');
      this.remoteSnippetList = undefined;
    }

    if (fs.existsSync(tmpDir)) {
      Logger.log('已清除文件缓存');
      await fs.remove(tmpDir);
    }

    await coreCaches.cleanCaches();
    Logger.log('已清除 内存/Redis 缓存');
  }
}
