import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrap } from '../../src/bootstrap';
import { SurgioService } from '../../src/surgio/surgio.service';

describe('ApiController (e2e)', () => {
  let app: NestFastifyApplication;
  let token;
  let tokenCookie;
  let surgioService;

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

  test('/api/auth/validate (GET)', async () => {
    expect((
      await app.inject({
        url: '/api/auth/validate',
        cookies: {
          _t: tokenCookie
        },
      } as any)
    ).statusCode).toBe(200);

    expect((
      await app.inject({
        url: '/api/auth/validate',
        cookies: {
          _t: 'wrong'
        },
      } as any)
    ).statusCode).toBe(401);
  });

  test('/api/config (GET)', async () => {
    const res = await app.inject({
      url: '/api/config',
      cookies: {
        _t: tokenCookie
      },
    } as any);

    expect(res.statusCode).toBe(200);
  });

  test('/api/artifacts (GET)', async () => {
    const res = await app.inject({
      url: '/api/artifacts',
      cookies: {
        _t: tokenCookie
      },
    } as any);

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchSnapshot();
  });

  test('/api/providers (GET)', async () => {
    const res = await app.inject({
      url: '/api/providers',
      cookies: {
        _t: tokenCookie
      },
    } as any);

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchSnapshot();
  });
});
