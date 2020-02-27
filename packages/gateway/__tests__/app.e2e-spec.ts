import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrap } from '../src/bootstrap';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootstrap();

    const configService = app.get('ConfigService');

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
        access_token: 'abcd',
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
        access_token: 'abcd',
        dl: '1',
      },
    });

    expect(res.headers['content-disposition']).toBe('attachment; filename="test.conf"');
  });

  test('/get-artifact (GET) userinfo header', async () => {
    const res = await app.inject({
      url: '/get-artifact/test3.conf',
      query: {
        access_token: 'abcd',
      },
    });

    expect(res.headers['subscription-userinfo'])
      .toBe('upload=891332010; download=29921186546; total=322122547200; expire=1586330887');
  });

  test('/get-artifact (GET) 404', async () => {
    const res = await app.inject({
      url: '/get-artifact/notfound.conf',
      query: {
        access_token: 'abcd',
      },
    });

    expect(res.statusCode).toBe(404);
  });

  test('/get-artifact (GET) unauthorized request', async () => {
    const res = await app.inject({
      url: '/get-artifact/test.conf',
    });

    expect(res.statusCode).toBe(401);
  });
});
