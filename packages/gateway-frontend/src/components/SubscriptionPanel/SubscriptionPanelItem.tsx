import { SubscriptionPanelItemProps } from '@/components/SubscriptionPanel/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { defaultFetcher } from '@/libs/utils'
import React from 'react'
import useSWR from 'swr'

function SubscriptionPanelItem({ provider }: SubscriptionPanelItemProps) {
  const { data, error } = useSWR<{
    used: number
    left: number
    expire: number
  }>(`/api/providers/${provider.name}/subscription`, defaultFetcher)

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{provider.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-center">
          <div>&nbsp;</div>
          <div>🚨 加载失败 🚨</div>
          <div>&nbsp;</div>
        </CardContent>
      </Card>
    )
  }

  if (typeof data === 'undefined') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{provider.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Skeleton className="w-[75%] h-[24px]" />
          <Skeleton className="w-full h-[24px]" />
          <Skeleton className="w-[50%] h-[24px]" />
        </CardContent>
      </Card>
    )
  }

  if (data === null) {
    return <></>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{provider.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div>已用流量：{data.used}</div>
          <div>剩余流量：{data.left}</div>
          <div>有效期至：{data.expire}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionPanelItem
