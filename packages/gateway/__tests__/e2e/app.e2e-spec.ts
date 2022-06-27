import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import supertest from 'supertest';
import Bluebird from 'bluebird';

import { AppModule } from '../../src/app.module';
import { applyMiddlwares } from '../../src/bootstrap';
import { SurgioService } from '../../src/surgio/surgio.service';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let token;
  let viewerToken;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    applyMiddlwares(app);

    const surgioService = app.get<SurgioService>('SurgioService');
    token = surgioService.config.gateway?.accessToken;
    viewerToken = surgioService.config.gateway?.viewerToken;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('/ (GET)', async () => {
    await supertest(app.getHttpServer()).get('/').expect(200);
  });

  test('/get-artifact (GET)', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/get-artifact/test.conf?access_token=${token}`
    );

    expect(res.status).toBe(200);
    expect(res.get('subscription-userinfo')).toBeUndefined();
    expect(res.text).toMatchSnapshot();
  });

  test('/get-artifact (GET) with viewerToken', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/get-artifact/test.conf?access_token=${viewerToken}`
    );

    expect(res.status).toBe(200);
    expect(res.get('subscription-userinfo')).toBeUndefined();
    expect(res.text).toMatchSnapshot();
  });

  test('/get-artifact (GET) attachment', async () => {
    await supertest(app.getHttpServer())
      .get(`/get-artifact/test.conf?access_token=${token}&dl=1`)
      .expect('content-disposition', 'attachment; filename="test.conf"');
  });

  test('/get-artifact (GET) userinfo header', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/get-artifact/test3.conf?access_token=${token}`
    );

    expect(res.get('subscription-userinfo')).toBe(
      'upload=891332010; download=29921186546; total=322122547200; expire=1586330887'
    );
  });

  test('/get-artifact (GET) 404', async () => {
    await supertest(app.getHttpServer())
      .get(`/get-artifact/notfound.conf?access_token=${token}`)
      .expect(404);
  });

  test('/get-artifact (GET) unauthorized supertest', async () => {
    await supertest(app.getHttpServer())
      .get(`/get-artifact/test.conf`)
      .expect(401);
    await supertest(app.getHttpServer())
      .get(`/get-artifact/notfound.conf?access_token=wrong`)
      .expect(401);
  });

  test('/get-artifact (GET) custom params', async () => {
    {
      const res = await supertest(app.getHttpServer()).get(
        `/get-artifact/custom-params.conf?access_token=${token}`
      );

      expect(res.status).toBe(200);
      expect(res.text).toMatchSnapshot();
    }

    {
      const res = await supertest(app.getHttpServer()).get(
        `/get-artifact/custom-params.conf?access_token=${token}&foo=new&child.bar=new`
      );

      expect(res.status).toBe(200);
      expect(res.text).toMatchSnapshot();
    }
  });

  test('/get-artifact (GET) error cache', async () => {
    await supertest(app.getHttpServer())
      .get(`/get-artifact/clash-error-after-first.conf?access_token=${token}`)
      .expect(200);

    await Bluebird.delay(500);

    const res = await supertest(app.getHttpServer()).get(
      `/get-artifact/clash-error-after-first.conf?access_token=${token}`
    );

    expect(res.status).toBe(200);
    expect(res.get('x-use-cache')).toBe('true');
  });

  test('customParams should not contaminate prototype', async () => {
    await supertest(app.getHttpServer()).get(
      `/get-artifact/custom-params.conf?access_token=${token}&constructor.prototype.hacked=bar`
    );
    expect(({} as any).hacked).toBeUndefined();
  });

  test('/export-providers (GET)', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash&format=surge-policy`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) with viewerToken', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${viewerToken}&providers=clash&format=surge-policy`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) multiple providers', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom&format=surge-policy`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) multiple providers 404', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom,notfound&format=surge-policy`
    );

    expect(res.status).toBe(404);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) global filter', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom&format=surge-policy&filter=customFilters.globalFilter`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) internal filter', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom&format=surge-policy&filter=hkFilter`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) private filter', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom&format=surge-policy&filter=customFilters.testFilter`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) using template', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/export-providers?access_token=${token}&providers=clash,custom&template=export`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/export-providers (GET) using wrong template', async () => {
    await supertest(app.getHttpServer())
      .get(
        `/export-providers?access_token=${token}&providers=clash,custom&template=notfound`
      )
      .expect(500);
  });

  test('/export-providers (GET) unauthorized supertest', async () => {
    await supertest(app.getHttpServer())
      .get(`/export-providers?providers=clash`)
      .expect(401);
    await supertest(app.getHttpServer())
      .get(`/export-providers?access_token=wrong&providers=clash`)
      .expect(401);
  });

  test('/render (GET)', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/render?access_token=${token}&template=render`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/render (GET) with viewerToken', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/render?access_token=${viewerToken}&template=render`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/render (GET) sub folder', async () => {
    const res = await supertest(app.getHttpServer()).get(
      `/render?access_token=${token}&template=sub-folder%2Frender`
    );

    expect(res.status).toBe(200);
    expect(res.text).toMatchSnapshot();
  });

  test('/render (GET) not found', async () => {
    await supertest(app.getHttpServer())
      .get(`/render?access_token=${token}&template=render-not-found`)
      .expect(404);
  });
});
