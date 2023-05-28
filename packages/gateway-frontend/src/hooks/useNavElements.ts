import { useLocation } from 'react-router-dom'

import { BAREBONE_PAGES } from '@/libs/constant'

export default function useNavElements() {
  const location = useLocation()
  const result = BAREBONE_PAGES.some((page) => page.test(location.pathname))

  return !result
}
