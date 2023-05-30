import { NormalizedOptions } from 'ky'
import ky from 'ky'

import { stores } from '../stores'

const client = ky.create({
  hooks: {
    beforeRequest: [
      (request) => {
        if (stores.config.config?.accessToken) {
          request.headers.set(
            'Authorization',
            `Bearer ${stores.config.config.accessToken}`
          )
        }
      },
    ],
    afterResponse: [
      (request: Request, options: NormalizedOptions, response: Response) => {
        if (response.status === 401 && window.location.pathname !== '/auth') {
          window.location.href = '/api/auth/logout'
          return
        }
        return response
      },
    ],
  },
})

export default client
