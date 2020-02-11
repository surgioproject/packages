import React from 'react';

import { ConfigStore } from './config';

export const StoresContext = React.createContext({
  config: new ConfigStore(),
});

export const useStores = () => React.useContext(StoresContext);
