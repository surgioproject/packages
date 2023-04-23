import React from 'react'

import { ConfigStore } from './config'

export const stores = {
  config: new ConfigStore(),
}

export const StoresContext = React.createContext(stores)

export const useStores = () => React.useContext(StoresContext)
