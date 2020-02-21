import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import FastifyCookie from 'fastify-cookie';
import fastifyAdapter from '../src/app.adapter';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(fastifyAdapter);

    const configService = app.get('ConfigService');
    const secret = configService.get('secret');

    app.register(FastifyCookie, {
      secret, // for cookies signature
      parseOptions: {}, // options for parsing cookies
    });

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
