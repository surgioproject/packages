import path from 'path';
import fs from 'fs';
import nunjucks, { Environment } from 'nunjucks';
import getEngine from 'surgio/build/template';
import { ArtifactConfig, CommandConfig, RemoteSnippet } from 'surgio/build/types';
import { loadRemoteSnippetList } from 'surgio/build/utils/remote-snippet';
import { resolve } from 'url';
import { PackageJson } from 'type-fest';

export class SurgioHelper {
  public static getEditUrl(repository: PackageJson['repository'], p: string): string {
    if (repository) {
      const base = typeof repository === 'string' ?
        repository :
        repository.url;

      return resolve(base.endsWith('/') ? base : `${base}/`, p);
    } else {
      return '';
    }
  }

  public remoteSnippetList: ReadonlyArray<RemoteSnippet>;
  public artifactList: ReadonlyArray<ArtifactConfig>;
  public readonly templateEngine?: Environment;
  private readonly pkgFile?: PackageJson;

  constructor(public cwd: string, public readonly config: CommandConfig) {
    const pkgFile = path.join(cwd, 'package.json');

    this.artifactList = config.artifacts;
    this.templateEngine = getEngine(config.templateDir, config.publicUrl);
    if (fs.existsSync(pkgFile)) {
      this.pkgFile = require(pkgFile);
    }
  }

  public async init(): Promise<SurgioHelper> {
    const remoteSnippetsConfig = this.config.remoteSnippets || [];
    this.remoteSnippetList = await loadRemoteSnippetList(remoteSnippetsConfig);

    return this;
  }
}
