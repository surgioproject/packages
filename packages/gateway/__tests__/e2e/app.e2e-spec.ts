import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrap } from '../../src/bootstrap';
import { SurgioService } from '../../src/surgio/surgio.service';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let token;

  beforeAll(async () => {
    app = await bootstrap();

    const surgioService = app.get<SurgioService>('SurgioService');
    token = surgioService.config.gateway?.accessToken;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('/ (GET)', async () => {
    const res = await app.inject({
      url: '/',
    });

    expect(res.statusCode).toBe(200);
  });

  test('/get-artifact (GET)', async () => {
    const res = await app.inject({
      url: '/get-artifact/test.conf',
      query: {
        access_token: token,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['subscription-userinfo']).toBeUndefined();
    expect(res.payload).toMatchSnapshot();
  });

  test('/get-artifact (GET) attachment', async () => {
    const res = await app.inject({
      url: '/get-artifact/test.conf',
      query: {
        access_token: token,
        dl: '1',
      },
    });

    expect(res.headers['content-disposition']).toBe('attachment; filename="test.conf"');
  });

  test('/get-artifact (GET) userinfo header', async () => {
    const res = await app.inject({
      url: '/get-artifact/test3.conf',
      query: {
        access_token: token,
      },
    });

    expect(res.headers['subscription-userinfo'])
      .toBe('upload=891332010; download=29921186546; total=322122547200; expire=1586330887');
  });

  test('/get-artifact (GET) 404', async () => {
    const res = await app.inject({
      url: '/get-artifact/notfound.conf',
      query: {
        access_token: token,
      },
    });

    expect(res.statusCode).toBe(404);
  });

  test('/get-artifact (GET) unauthorized request', async () => {
    expect((
      await app.inject({
        url: '/get-artifact/test.conf',
      })
    ).statusCode).toBe(401);
    expect((
      await app.inject({
        url: '/get-artifact/test.conf',
        query: {
          access_token: 'wrong',
        },
      })
    ).statusCode).toBe(401);
  });
});
