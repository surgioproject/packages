import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrap } from '../../src/bootstrap';
import { SurgioService } from '../../src/surgio/surgio.service';

describe('ApiController (e2e)', () => {
  let app: NestFastifyApplication;
  let token;
  let tokenCookie;
  let surgioService: SurgioService;

  beforeAll(async () => {
    app = await bootstrap();
    surgioService = app.get<SurgioService>('SurgioService');
    token = surgioService.config.gateway?.accessToken;

    await app.init();

    const auth = await app.inject({
      url: '/api/auth',
      method: 'POST',
      payload: {
        accessToken: token,
      },
    });
    tokenCookie = (auth as any).cookies[0].value;
  });

  afterAll(async () => {
    await app.close();
  });

  test('/api/auth/validate-cookie (GET)', async () => {
    expect((
      await app.inject({
        url: '/api/auth/validate-cookie',
        cookies: {
          _t: tokenCookie
        },
      } as any)
    ).statusCode).toBe(200);
    expect((
      await app.inject({
        url: '/api/auth/validate-cookie',
        cookies: {
          _t: 'wrong'
        },
      } as any)
    ).statusCode).toBe(401);
  });

  test('/api/auth/validate-token (GET)', async () => {
    expect((
      await app.inject({
        url: '/api/auth/validate-token',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    ).statusCode).toBe(200);
    expect((
      await app.inject({
        url: '/api/auth/validate-token',
        headers: {
          Authorization: `Bearer wrong`,
        },
      })
    ).statusCode).toBe(401);
  });

  test('/api/config (GET)', async () => {
    const res = await app.inject({
      url: '/api/config',
    });

    expect(res.statusCode).toBe(200);
  });

  test('/api/artifacts (GET)', async () => {
    const res = await app.inject({
      url: '/api/artifacts',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchSnapshot();
  });

  test('/api/providers (GET)', async () => {
    const res = await app.inject({
      url: '/api/providers',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchSnapshot();
  });
});
