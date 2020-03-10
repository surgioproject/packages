import { NormalizedOptions } from 'ky';
import ky from 'ky-universal';

import { stores } from '../stores';

const client = ky.create({
  hooks: {
    beforeRequest: [
      request => {
        if (stores.config.config?.accessToken) {
          request.headers.set('Authorization', `Bearer ${stores.config.config?.accessToken}`);
        }
      },
    ],
    afterResponse: [
      // Or retry with a fresh token on a 403 error
      (request: Request, options: NormalizedOptions, response: Response) => {
        if (response.status === 401 && window.location.pathname !== '/auth') {
          window.location.href = '/auth';
          return;
        }
        return response;
      }
    ],
  },
});

export default client;
