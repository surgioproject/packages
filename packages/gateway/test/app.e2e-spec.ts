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

    console.log(res.payload);
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
