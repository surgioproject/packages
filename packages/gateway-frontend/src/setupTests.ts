// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import fetch, { Headers, Request, Response } from 'node-fetch';
import AbortController from 'abort-controller';

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.AbortController = AbortController;

declare global {
  namespace NodeJS {
    interface Global {
      fetch: typeof fetch;
      Headers: typeof Headers;
      Request: typeof Request;
      Response: typeof Response;
      AbortController: typeof AbortController;
    }
  }
}
