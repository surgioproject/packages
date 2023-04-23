import fetchMock from 'fetch-mock'

import client from './http'

afterEach(() => {
  fetchMock.reset()
})

test('http client', async () => {
  fetchMock.get('/api/test', 200)

  await client.get('/api/test')
})

test('http client handles 401', async () => {
  delete window.location
  window.location = {
    href: '',
  } as any

  fetchMock.get('/api/test', 401)

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await client.get('/api/test').catch((err) => {})

  expect(window.location.href).toBe('/auth')
})
