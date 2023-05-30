import { Loader2 } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import ProviderCard from '@/components/ProviderCard'
import { Provider } from '@/libs/types'
import { defaultFetcher } from '@/libs/utils'

const Page: React.FC = () => {
  const { data: providerList, error } = useSWR<ReadonlyArray<Provider>>(
    '/api/providers',
    defaultFetcher
  )

  const getProviderListElement = () => {
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

    return (
      <>
        {providerList.map((provider) => {
          return (
            <div key={provider.name}>
              <ProviderCard provider={provider} />
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Providers</CardTitle>
        </CardHeader>
      </Card>

      <div className="mt-6 lg:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {getProviderListElement()}
      </div>
    </div>
  )
}

export default Page
