import type { AddressInfo } from 'node:net'

import { createHttpServer, createLambdaHandler } from '../../src'

interface LambdaResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

describe('Gateway server entrypoints (e2e)', () => {
  beforeAll(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  test('createHttpServer serves the frontend', async () => {
    const server = createHttpServer()

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })

    try {
      const address = server.address() as AddressInfo
      const response = await fetch(`http://127.0.0.1:${address.port}/`)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
      expect(await response.text()).toContain('<!DOCTYPE html>')
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }
  })

  test('createLambdaHandler serves an API Gateway v2 request', async () => {
    const handler = createLambdaHandler()
    const response = (await handler(
      {
        version: '2.0',
        rawPath: '/',
        rawQueryString: '',
        headers: {},
        requestContext: {
          http: {
            method: 'GET',
            sourceIp: '127.0.0.1',
          },
        },
        isBase64Encoded: false,
      },
      {}
    )) as LambdaResponse

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.body).toContain('<!DOCTYPE html>')
  })
})
