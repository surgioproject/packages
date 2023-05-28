import client from '@/libs/http'
import { useStores } from '@/stores'
import Divider from '@mui/material/Divider'
import { observer } from 'mobx-react-lite'
import { useSnackbar } from 'notistack'
import React from 'react'
import {
  DownloadCloudIcon,
  PlaneTakeoffIcon,
  EraserIcon,
  HomeIcon,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { cn } from '@/libs/utils'

const AppDrawerContent = () => {
  const stores = useStores()
  const { enqueueSnackbar } = useSnackbar()
  const location = useLocation()

  const cleanCache = () => {
    return client.post('/api/clean-cache').then(() => {
      enqueueSnackbar('清除成功', { variant: 'success' })
    })
  }

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Artifacts', href: '/artifacts', icon: DownloadCloudIcon },
    { name: 'Providers', href: '/providers', icon: PlaneTakeoffIcon },
    {
      name: '清除缓存',
      onClick: () => {
        cleanCache()
      },
      icon: EraserIcon,
    },
  ] as const

  return (
    <>
      <div className="flex-col content-center p-4">
        {stores.config.isReady ? (
          <div className="text-sm">
            <div>
              <span>Core: </span>
              <code>v{stores.config.config.coreVersion}</code>
            </div>
            <div>
              <span>Backend: </span>
              <code>v{stores.config.config.backendVersion}</code>
            </div>
          </div>
        ) : null}
      </div>

      <Divider />

      <ul role="list" className="flex flex-1 flex-col space-y-3 py-4">
        {navigation.map((item) => {
          const isCurrent = 'href' in item && location.pathname === item.href

          return (
            <li key={item.name}>
              {'href' in item ? (
                <Link
                  to={item.href}
                  className={cn(
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'text-primary hover:bg-secondary hover:text-secondary-foreground',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                  )}
                >
                  <item.icon
                    className={cn(
                      isCurrent
                        ? 'color-primary'
                        : 'color-secondary group-hover:color-primary',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ) : null}

              {'onClick' in item ? (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'text-primary hover:bg-secondary hover:text-secondary-foreground',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full'
                  )}
                >
                  <item.icon
                    className={cn(
                      'color-secondary group-hover:color-primary',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default observer(AppDrawerContent)
