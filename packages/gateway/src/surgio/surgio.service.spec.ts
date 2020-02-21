import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import path from 'path';

import { SurgioModule } from './surgio.module';
import { SurgioService } from './surgio.service';

describe('SurgioService', () => {
  let surgioService: SurgioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [
        SurgioModule.register({
          cwd: path.join(__dirname, '../../test/fixtures/gateway'),
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

    expect(artifact).toMatchSnapshot();
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
    expect(
      await surgioService.transformArtifact('test.conf', 'unknown')
    ).toBeInstanceOf(HttpException);
  });

  test('transformArtifact filter should work', async () => {
    expect(
      await surgioService.transformArtifact('test.conf', 'surge-policy', 'globalFilter')
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact('test.conf', 'qx-server', 'globalFilter')
    ).toMatchSnapshot();
    expect(
      await surgioService.transformArtifact('test.conf', 'clash-provider', 'globalFilter')
    ).toMatchSnapshot();
  });
});
