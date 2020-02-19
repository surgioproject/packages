import { NormalizedOptions } from 'ky';
import ky from 'ky-universal';

const client = ky.create({
  hooks: {
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
