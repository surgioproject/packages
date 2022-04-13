import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import httpClient from 'surgio/build/utils/http-client';

import { SurgioModule } from './surgio.module';
import { SurgioService } from './surgio.service';

describe('SurgioService', () => {
  let surgioService: SurgioService;
  let mockedHttpClient;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockedHttpClient = jest.spyOn(httpClient, 'get');

    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [
        SurgioModule.register({
          cwd: join(__dirname, '../../__tests__/__fixtures__/gateway'),
        }),
      ],
    }).compile();

    surgioService = module.get<SurgioService>(SurgioService);
  });

  it('should be defined', () => {
    expect(surgioService).toBeDefined();
  });

  test('getArtifact should work', async () => {
    const artifact = await surgioService.getArtifact('test.conf');

    expect(artifact).not.toBeUndefined();
    expect(artifact?.render()).toMatchSnapshot();
  });

  test('transformArtifact format should work', async () => {
    expect(
      await surgioService.transformArtifact('test.conf', 'surge-policy')
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact('test.conf', 'qx-server')
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact('test.conf', 'clash-provider')
    ).toMatchSnapshot();
    await expect(
      surgioService.transformArtifact('test.conf', 'unknown')
    ).rejects.toThrowError(HttpException);
  });

  test('transformArtifact filter should work', async () => {
    expect(
      await surgioService.transformArtifact(
        'test.conf',
        'surge-policy',
        'customFilters.globalFilter'
      )
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact(
        'test.conf',
        'qx-server',
        'customFilters.globalFilter'
      )
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact(
        'test.conf',
        'clash-provider',
        'customFilters.globalFilter'
      )
    ).toMatchSnapshot();
  });

  test('listProviders', () => {
    const providers = surgioService.listProviders();

    expect(providers).toHaveLength(6);

    providers.forEach((item) => {
      expect(item.name).toBeDefined();
    });
  });
});
