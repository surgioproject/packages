import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { generate } from 'surgio/build/generate';
import { Artifact } from 'surgio/build/generator/artifact';
import { getProvider } from 'surgio/build/provider';
import { ArtifactConfig } from 'surgio/build/types';
import * as filters from 'surgio/build/utils/filter';

import { SurgioHelper } from './surgio-helper';

@Injectable()
export class SurgioService {
  constructor(@Inject('SURGIO_HELPER') public surgioHelper: SurgioHelper) {}

  public async getArtifact(artifactName: string): Promise<Artifact> {
    const target = this.surgioHelper.artifactList.filter(item => item.name === artifactName);

    if (!target.length) {
      return undefined;
    }

    const artifactInstance = new Artifact(
      this.surgioHelper.config,
      target[0],
      {
        remoteSnippetList: this.surgioHelper.remoteSnippetList,
      }
    );

    return await artifactInstance.init(this.surgioHelper.templateEngine);
  }

  public async transformArtifact(artifactName: string, format: string, filter?: string): Promise<Artifact|string|HttpException> {
    const target = this.surgioHelper.artifactList.filter(item => item.name === artifactName);
    let filterName;

    if (!target.length) {
      return undefined;
    }
    if (filter) {
      filterName = filters.hasOwnProperty(filter) ? filter : `customFilters.${filter}`;
    }

    switch (format) {
      case 'surge-policy': {
        const artifact = {
          ...target[0],
          template: undefined,
          templateString: `{{ getSurgeNodes(nodeList${filterName ? `, ${filterName}` : ''}) }}`,
        };
        return await generate(
          this.surgioHelper.config,
          artifact,
          this.surgioHelper.remoteSnippetList,
          this.surgioHelper.templateEngine
        );
      }

      case 'qx-server': {
        const artifact = {
          ...target[0],
          template: undefined,
          templateString: `{{ getQuantumultXNodes(nodeList${filterName ? `, ${filterName}` : ''}) }}`,
        };
        return await generate(
          this.surgioHelper.config,
          artifact,
          this.surgioHelper.remoteSnippetList,
          this.surgioHelper.templateEngine
        );
      }

      case 'clash-provider': {
        const artifact = {
          ...target[0],
          template: undefined,
          templateString: [
            '---',
            'proxies:',
            `{{ getClashNodes(nodeList${filterName ? `, ${filterName}` : ''}) | yaml }}`,
            '...'
          ].join('\n')
        };
        return await generate(
          this.surgioHelper.config,
          artifact,
          this.surgioHelper.remoteSnippetList,
          this.surgioHelper.templateEngine
        );
      }

      default:
        return new HttpException( 'unsupported format', HttpStatus.BAD_REQUEST);
    }
  }

  public listProviders(): ReadonlyArray<ReturnType<typeof getProvider>> {
    return Array.from(this.surgioHelper.providerMap.values());
  }
}
