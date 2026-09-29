import React from 'react'
import { render, screen } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { defaultFetcher } from '@/libs/utils'

import SubscriptionPanel from './'

vi.mock('@/libs/utils', () => ({ defaultFetcher: vi.fn() }))

test('shows Oixcloud subscription usage and expiry from the Gateway API', async () => {
  vi.mocked(defaultFetcher).mockImplementation(async (url) => {
    if (url === '/api/providers') {
      return [
        {
          name: 'Oixcloud',
          type: 'clash',
          url: 'https://provider.example/subscription',
          supportGetSubscriptionUserInfo: true,
        },
        {
          name: 'custom',
          type: 'custom',
          supportGetSubscriptionUserInfo: false,
        },
      ]
    }
    if (url === '/api/providers/Oixcloud/subscription') {
      return {
        upload: '1 KiB',
        download: '2 KiB',
        used: '3 KiB',
        left: '7 KiB',
        total: '10 KiB',
        expire: '2030-01-01 (about 3 years)',
      }
    }
    throw new Error(`Unexpected request: ${url}`)
  })

  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <SubscriptionPanel />
    </SWRConfig>
  )

  expect(await screen.findByText('已用流量：3 KiB')).toBeInTheDocument()
  expect(screen.getByText('Oixcloud')).toBeInTheDocument()
  expect(screen.getByText('剩余流量：7 KiB')).toBeInTheDocument()
  expect(
    screen.getByText('有效期至：2030-01-01 (about 3 years)')
  ).toBeInTheDocument()
  expect(screen.queryByText('🚧 暂无可用订阅 🚧')).not.toBeInTheDocument()
})
