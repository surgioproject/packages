import { Loader2 } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'
import uniqWith from 'lodash-es/uniqWith'
import { Provider } from '@/libs/types'
import { defaultFetcher } from '@/libs/utils'

import SubscriptionPanelItem from './SubscriptionPanelItem'

export interface SubscriptionPanelItemProps {
  provider: Provider
}

function SubscriptionPanel() {
  const { data: providerList, error } = useSWR<ReadonlyArray<Provider>>(
    '/api/providers',
    defaultFetcher
  )

  if (error) {
    return (
      <div className="flex justify-center text-2xl font-semibold">
        🚨 加载失败 🚨
      </div>
    )
  }

  if (!providerList) {
    return (
      <div className="flex justify-center items-center text-lg">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载中...
      </div>
    )
  }

  const supportedProviderList = uniqWith(
    providerList.filter((provider) => {
      if (provider.type === 'blackssl') {
        return provider.supportGetSubscriptionUserInfo
      } else {
        return provider.supportGetSubscriptionUserInfo && provider.url
      }
    }),
    (provider, other) => {
      if (provider.type === 'blackssl' && other.type === 'blackssl') {
        return provider.username === other.username
      } else if (other.type !== 'blackssl') {
        return provider.url === other.url
      }
      return false
    }
  )

  return (
    <>
      <div className="font-semibold tracking-tight text-lg">订阅</div>

      <div className="mt-3 lg:mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {supportedProviderList.map((provider: Provider) => {
          return (
            <div key={provider.name}>
              <SubscriptionPanelItem provider={provider} />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default SubscriptionPanel
