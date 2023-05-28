import AppDrawer from '@/components/AppDrawer'
import AppHeader from '@/components/AppHeader'
import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Routes, Route, useLocation } from 'react-router-dom'
import loadable from '@loadable/component'

import './App.css'
import useNavElements from './hooks/useNavElements'
import { defaultFetcher } from './libs/utils'
import { useStores } from './stores'
import { Config } from './stores/config'
import NotFoundPage from './pages/NotFound'

const ArtifactListPage = loadable(() => import('./pages/ArtifactList'), {})
const ProviderListPage = loadable(() => import('./pages/ProviderList'), {})
const HomePage = loadable(() => import('./pages/Home'), {})
const AuthPage = loadable(() => import('./pages/Auth'), {})
const EmbedArtifactPage = loadable(() => import('./pages/embeds/Artifact'), {})

const App = () => {
  const stores = useStores()
  const isShowNavElements = useNavElements()
  const location = useLocation()
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false)

  const validateAuth = useCallback(() => {
    const search = new URLSearchParams(location.search)

    if (search.get('access_token')) {
      stores.config.updateConfig({
        accessToken: search.get('access_token'),
      })

      return defaultFetcher<{
        roles: string[]
        accessToken?: string
        viewerToken?: string
      }>('/api/auth/validate-token')
    }

    return defaultFetcher<{
      roles: string[]
      accessToken?: string
      viewerToken?: string
    }>('/api/auth/validate-cookie')
  }, [location.search, stores.config])

  const fetchConfig = () => {
    return defaultFetcher<Partial<Config>>('/api/config')
  }

  useEffect(() => {
    validateAuth()
      .then((user) => {
        if (user.accessToken) {
          stores.config.updateConfig({
            accessToken: user.accessToken,
          })
        }

        if (user.viewerToken) {
          stores.config.updateConfig({
            viewerToken: user.viewerToken,
          })
        }

        return fetchConfig()
      })
      .catch(() => {
        // 授权失败，直接获取配置信息
        return fetchConfig()
      })
      .then((config) => {
        stores.config.updateConfig(config)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [stores.config, validateAuth])

  return (
    <div>
      {stores.config.isReady ? (
        <>
          {isShowNavElements ? (
            <>
              <AppHeader
                onAppDrawerButtonClick={() => setIsAppDrawerOpen(true)}
              />

              <AppDrawer
                isOpen={isAppDrawerOpen}
                onClose={() => setIsAppDrawerOpen(false)}
              />
            </>
          ) : null}

          <main className="py-10 lg:pl-72  bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/artifacts" element={<ArtifactListPage />} />
                <Route path="/providers" element={<ProviderListPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/embed/artifact/:artifactName"
                  element={<EmbedArtifactPage />}
                />
                <Route path="/" element={<HomePage />} />
                <Route path="/*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
        </>
      ) : null}
    </div>
  )
}

export default observer(App)
