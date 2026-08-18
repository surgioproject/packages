import { describe, expect, test, vi } from 'vitest'

import { createGatewayApp } from './app.js'

import type { GatewayCache, GatewayRuntime } from './types.js'

const config = {
  urlBase: 'https://example.com/',
  publicUrl: 'https://example.com/',
  coreVersion: '4.0.0',
  auth: true,
  accessToken: 'admin-token',
  viewerToken: 'viewer-token',
  useCacheOnError: true,
}

const createFixture = () => {
  const values = new Map<string, unknown>()
  const cacheSet = vi.fn(async (key: string, value: unknown) => {
    values.set(key, value)
  })
  const cache: GatewayCache = {
    async get(key) {
      return values.get(key) as never
    },
    set: cacheSet,
  }
  const runtime: GatewayRuntime = {
    renderArtifact: vi.fn(async (name, options) => ({
      body: `${name}:${JSON.stringify(options?.customParams)}`,
      artifact: { name },
      subscriptionUserInfo: { upload: 1, download: 2, total: 3, expire: 4 },
      subscriptionUserInfoMap: {},
    })),
    renderProviders: vi.fn(async (options) => ({
      body: `providers:${(options.providers as string[]).join(',')}`,
      artifact: { name: 'providers.conf' },
      subscriptionUserInfoMap: {},
    })),
    renderTemplate: vi.fn(async (name) => `template:${name}`),
    listArtifacts: () => [{ name: 'demo.conf', provider: 'demo' }],
    listProviders: () => ['demo'],
    getProviderInfo: vi.fn(async (name) =>
      name === 'demo'
        ? { name, type: 'custom', supportGetSubscriptionUserInfo: true }
        : undefined,
    ),
    getProviderSubscription: vi.fn(async () => ({ upload: 1, total: 10 })),
    getGatewayConfig: () => config,
    resetCache: vi.fn(async () => undefined),
    close: vi.fn(async () => undefined),
  }
  const app = createGatewayApp({
    runtime,
    cache,
    assets: { fetch: async () => new Response('spa') },
    logger: { warn: vi.fn(), error: vi.fn() },
  })
  return { app, cacheSet, runtime, values }
}

const auth = { Authorization: 'Bearer admin-token' }

describe('createGatewayApp', () => {
  test('renders artifacts and preserves safe structured query values', async () => {
    const { app, cacheSet, runtime } = createFixture()
    const response = await app.request(
      '/get-artifact/demo.conf?access_token=viewer-token&foo[]=first&foo[]=second&child[bar]=nested&constructor.prototype.polluted=yes',
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('subscription-userinfo')).toBe(
      'upload=1; download=2; total=3; expire=4',
    )
    expect(await response.text()).toContain(
      '"foo":["first","second"],"child":{"bar":"nested"}',
    )
    expect(({} as { polluted?: string }).polluted).toBeUndefined()
    expect(runtime.renderArtifact).toHaveBeenCalledOnce()
    expect(runtime.renderArtifact).toHaveBeenCalledWith(
      'demo.conf',
      expect.objectContaining({
        downloadUrl:
          'https://example.com/get-artifact/demo.conf?access_token=viewer-token&foo[]=first&foo[]=second&child[bar]=nested&constructor.prototype.polluted=yes',
      }),
    )
    expect(cacheSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      7 * 24 * 60 * 60_000,
    )
  })

  test('supports download and provider export aliases', async () => {
    const { app, runtime } = createFixture()
    const artifact = await app.request(
      '/get-artifact/demo.conf?access_token=viewer-token&dl=1&format=surge-policy',
    )
    expect(artifact.headers.get('content-disposition')).toBe(
      'attachment; filename="demo.conf"',
    )
    expect(runtime.renderArtifact).toHaveBeenCalledWith(
      'demo.conf',
      expect.objectContaining({ format: 'surge' }),
    )

    const providers = await app.request(
      '/export-providers?access_token=viewer-token&providers=demo&format=qx-server',
    )
    expect(await providers.text()).toBe('providers:demo')
    expect(runtime.renderProviders).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'quantumultx' }),
    )
  })

  test('validates provider export input and missing resources', async () => {
    const { app } = createFixture()
    expect((await app.request('/export-providers?access_token=viewer-token')).status).toBe(400)
    expect(
      (
        await app.request(
          '/export-providers?access_token=viewer-token&providers=missing&format=surge-policy',
        )
      ).status,
    ).toBe(404)
    expect((await app.request('/get-artifact/missing?access_token=viewer-token')).status).toBe(404)
  })

  test('renders templates and serves assets as SPA fallback', async () => {
    const { app } = createFixture()
    const rendered = await app.request('/render?access_token=viewer-token&template=folder%2Fdemo')
    expect(await rendered.text()).toBe('template:folder/demo')
    expect((await app.request('/render?access_token=viewer-token')).status).toBe(400)
    expect(await (await app.request('/')).text()).toBe('spa')
  })

  test('implements login, cookie, bearer, query token and roles', async () => {
    const { app } = createFixture()
    const login = await app.request('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accessToken: 'admin-token' }),
    })
    expect(login.status).toBe(200)
    const cookie = login.headers.get('set-cookie') as string
    expect(cookie).toContain('_t=')
    expect((await app.request('/api/auth/validate-cookie', { method: 'POST', headers: { cookie } })).status).toBe(200)
    expect((await app.request('/api/auth/validate-token', { method: 'POST', headers: auth })).status).toBe(200)
    expect((await app.request('/api/artifacts?access_token=viewer-token')).status).toBe(403)
    expect((await app.request('/api/artifacts', { headers: auth })).status).toBe(200)
    expect((await app.request('/api/auth', { method: 'POST', body: '{}' })).status).toBe(401)
    expect((await app.request('/api/auth/logout', { method: 'POST' })).headers.get('set-cookie')).toContain('_t=')
    expect((await app.request('/api/auth/logout')).status).toBe(302)
  })

  test('exposes all management API contracts', async () => {
    const { app, runtime } = createFixture()
    expect((await app.request('/api/config')).status).toBe(200)
    expect((await app.request('/api/artifacts/demo.conf?access_token=viewer-token')).status).toBe(200)
    expect((await app.request('/api/artifacts/missing?access_token=viewer-token')).status).toBe(404)
    expect((await app.request('/api/providers', { headers: auth })).status).toBe(200)
    expect((await app.request('/api/providers/demo/subscription', { headers: auth })).status).toBe(200)
    expect((await app.request('/api/providers/missing/subscription', { headers: auth })).status).toBe(404)
    expect((await app.request('/api/clean-cache', { method: 'POST', headers: auth })).status).toBe(200)
    expect(runtime.resetCache).toHaveBeenCalledOnce()
  })

  test('uses cached payload when rendering fails', async () => {
    const { app, runtime } = createFixture()
    const url = '/get-artifact/demo.conf?access_token=viewer-token'
    expect((await app.request(url)).status).toBe(200)
    vi.mocked(runtime.renderArtifact).mockRejectedValueOnce(new Error('offline'))
    const cached = await app.request(url)
    expect(cached.status).toBe(200)
    expect(cached.headers.get('x-use-cache')).toBe('true')
  })
})
