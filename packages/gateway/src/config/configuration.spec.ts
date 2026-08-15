import configuration from './configuration'

describe('configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('uses port 4000 by default', () => {
    vi.stubEnv('PORT', '')

    expect(configuration().port).toBe(4000)
  })

  test('uses the configured port', () => {
    vi.stubEnv('PORT', '4100')

    expect(configuration().port).toBe(4100)
  })
})
