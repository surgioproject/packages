export interface Provider {
  name: string
  type: string
  url?: string
  supportGetSubscriptionUserInfo: boolean
  username?: string
}
