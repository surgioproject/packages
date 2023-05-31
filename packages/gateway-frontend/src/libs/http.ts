import axios, { isAxiosError } from 'axios'
import { stores } from '@/stores'

const client = axios.create({})

client.interceptors.request.use((config) => {
  if (stores.config.config?.accessToken) {
    config.headers.Authorization = `Bearer ${stores.config.config.accessToken}`
  }

  return config
})

client.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (!isAxiosError(error) || !error.response) {
      return Promise.reject(error)
    }

    if (error.response.status === 401 && window.location.pathname !== '/auth') {
      window.location.href = '/api/auth/logout'
      return
    }

    return Promise.reject(error)
  }
)

export default client
