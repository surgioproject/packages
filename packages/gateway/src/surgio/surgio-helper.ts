import { basename, join } from 'path';
import fs, { promises as fsp } from 'fs';
import { Environment } from 'nunjucks';
import semver from 'semver';
import { Logger } from '@nestjs/common';
import { getEngine } from 'surgio/build/generator/template';
import { getProvider } from 'surgio/build/provider';
import { ArtifactConfig, CommandConfig, RemoteSnippet } from 'surgio/build/types';
import { loadRemoteSnippetList } from 'surgio/build/utils/remote-snippet';
import { PackageJson } from 'type-fest';

type PossibleProviderType = ReturnType<typeof getProvider>;

export class SurgioHelper {
  public remoteSnippetList: ReadonlyArray<RemoteSnippet>;
  public artifactList: ReadonlyArray<ArtifactConfig>;
  public providerMap: Map<string, PossibleProviderType> = new Map();
  public readonly templateEngine?: Environment;

  private readonly pkgFile?: PackageJson;

  constructor(public cwd: string, public readonly config: CommandConfig) {
    const pkgFile = join(cwd, 'package.json');

    this.artifactList = config.artifacts;
    this.templateEngine = getEngine(config.templateDir, config.publicUrl);
    if (fs.existsSync(pkgFile)) {
      this.pkgFile = require(pkgFile);
    }
  }

  public async init(): Promise<this> {
    await this.checkCoreVersion();

    const remoteSnippetsConfig = this.config.remoteSnippets || [];
    this.remoteSnippetList = await loadRemoteSnippetList(remoteSnippetsConfig);

    await this.readProviders();

    return this;
  }

  private async readProviders(): Promise<void> {
    const files = await fsp.readdir(this.config.providerDir, {
      encoding: 'utf8',
    });

    async function readProvider(path): Promise<PossibleProviderType> {
      let provider;

      try {
        const providerName = basename(path, '.js');

        provider = getProvider(providerName, require(path));
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
    const corePkgFile = require('surgio/package.json');
    const gatewayPkgFile = require('../../package.json');
    const peerVersion = gatewayPkgFile.peerDependencies.surgio;

    if (!semver.satisfies(corePkgFile.version, peerVersion)) {
      Logger.warn('', undefined, false);
      Logger.warn('Surgio 版本过低，请升级后重新运行！', undefined, false);
      Logger.warn('', undefined, false);
      Logger.warn('  命令：', undefined, false);
      Logger.warn('  npm install surgio@latest', undefined, false);
      Logger.warn('', undefined, false);
      throw new Error('Surgio 版本过低');
    }
  }
}
