import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { generate } from 'surgio/build/generate';
import { Artifact } from 'surgio/build/generator/artifact';
import { getProvider } from 'surgio/build/provider';
import { CommandConfig } from 'surgio/build/types';
import * as filters from 'surgio/build/utils/filter';

import { SurgioHelper } from './surgio-helper';

@Injectable()
export class SurgioService {
  constructor(@Inject('SURGIO_HELPER') public surgioHelper: SurgioHelper) {}

  public get config(): CommandConfig {
    return this.surgioHelper.config;
  }

  public async getArtifact(artifactName: string): Promise<Artifact|undefined> {
    const target = this.surgioHelper.artifactList.filter(item => item.name === artifactName);

    if (!target.length) {
      return undefined;
    }

    const artifactInstance = new Artifact(
      this.surgioHelper.config,
      target[0],
      {
        remoteSnippetList: this.surgioHelper.remoteSnippetList,
        templateEngine: this.surgioHelper.templateEngine,
      }
    );

    return await artifactInstance.init();
  }

  public async exportProvider(providerName: string, format: string, options: { readonly filter?: string; readonly combineProviders?: ReadonlyArray<string>; } = {}): Promise<Artifact> {
    const artifactInstance = new Artifact(
      this.surgioHelper.config,
      {
        name: `${providerName}.conf`,
        provider: providerName,
        template: undefined,
        templateString: this.getTemplateByFormat(format, options.filter),
        ...(options.combineProviders ? {
          combineProviders: options.combineProviders,
        } : null),
      },
      {
        remoteSnippetList: this.surgioHelper.remoteSnippetList,
        templateEngine: this.surgioHelper.templateEngine,
      }
    );

    return await artifactInstance.init();
  }

  public async transformArtifact(artifactName: string, format: string, filter?: string): Promise<Artifact|string|undefined> {
    const target = this.surgioHelper.artifactList.filter(item => item.name === artifactName);

    if (!target.length) {
      return undefined;
    }

    const artifact = {
      ...target[0],
      template: undefined,
      templateString: this.getTemplateByFormat(format, filter),
    };

    return await generate(
      this.surgioHelper.config,
      artifact,
      this.surgioHelper.remoteSnippetList,
      this.surgioHelper.templateEngine
    );
  }

  public listProviders(): ReadonlyArray<ReturnType<typeof getProvider>> {
    return Array.from(this.surgioHelper.providerMap.values());
  }

  public getTemplateByFormat(format: string, filter?: string): string {
    let filterName;

    if (filter) {
      filterName = filters.hasOwnProperty(filter) ? filter : `customFilters.${filter}`;
    }

    switch (format) {
      case 'surge-policy':
        return `{{ getSurgeNodes(nodeList${filterName ? `, ${filterName}` : ''}) }}`;

      case 'qx-server':
        return `{{ getQuantumultXNodes(nodeList${filterName ? `, ${filterName}` : ''}) }}`;

      case 'clash-provider':
        return [
          '---',
          'proxies:',
          `{{ getClashNodes(nodeList${filterName ? `, ${filterName}` : ''}) | yaml }}`,
          '...'
        ].join('\n');

      default:
        throw new HttpException('参数 format 必须指定', HttpStatus.BAD_REQUEST);
    }
  }
}
