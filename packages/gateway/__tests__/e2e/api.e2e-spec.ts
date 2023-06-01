import { NestFactory } from '@nestjs/core'
import supertest from 'supertest'
import { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from '../../src/app.module'
import { applyMiddlwares } from '../../src/bootstrap'
import { SurgioService } from '../../src/surgio/surgio.service'
import { extractCookies } from '../helper'

describe('ApiController (e2e)', () => {
  let app: NestExpressApplication
  let token
  let viewerToken
  let tokenCookie
  let surgioService: SurgioService

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false })
    applyMiddlwares(app)

    surgioService = app.get<SurgioService>(SurgioService)
    token = surgioService.config.gateway?.accessToken
    viewerToken = surgioService.config.gateway?.viewerToken

    await app.init()

    const auth = await supertest(app.getHttpServer()).post('/api/auth').send({
      accessToken: token,
    })
    const cookies = extractCookies(auth.header)
    tokenCookie = cookies._t.value
  })

  afterAll(async () => {
    await app.close()
  })

  test('/api/auth (POST)', async () => {
    const auth = await supertest(app.getHttpServer()).post('/api/auth').send({
      accessToken: token,
    })
    const cookies = extractCookies(auth.header)
    expect(cookies._t.value).toBeDefined()
    expect(Number(cookies._t.flags['Max-Age'])).toBe(60 * 60 * 24 * 31)
    expect(cookies._t.flags.HttpOnly).toBe(true)
  })

  test('/api/auth/validate-cookie (GET)', async () => {
    await supertest(app.getHttpServer())
      .post('/api/auth/validate-cookie')
      .set('Cookie', `_t=${tokenCookie}`)
      .expect(200)

    await supertest(app.getHttpServer())
      .post('/api/auth/validate-cookie')
      .set('Cookie', `_t=wrong`)
      .expect(401)
  })

  test('/api/auth/validate-token (GET)', async () => {
    const res = await supertest(app.getHttpServer())
      .post('/api/auth/validate-token')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body.data).toEqual({
      roles: ['admin', 'viewer'],
      viewerToken: 'efgh',
    })

    const viewerRes = await supertest(app.getHttpServer())
      .post('/api/auth/validate-token')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200)

    expect(viewerRes.body.data).toEqual({
      roles: ['viewer'],
      viewerToken: 'efgh',
    })

    await supertest(app.getHttpServer())
      .post('/api/auth/validate-token')
      .set('Authorization', `Bearer wrong`)
      .expect(401)
  })

  test('/api/config (GET)', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/api/config')
      .expect(200)
    expect(res.body.data.needAuth).toBeDefined()
    expect(res.body.data.backendVersion).toBeDefined()
    expect(res.body.data.coreVersion).toBeDefined()
  })

  test('/api/artifacts (GET)', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/api/artifacts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.text).toMatchSnapshot()

    await supertest(app.getHttpServer())
      .get('/api/artifacts')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403)
  })

  test('/api/providers (GET)', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/api/providers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.text).toMatchSnapshot()
  })
})
