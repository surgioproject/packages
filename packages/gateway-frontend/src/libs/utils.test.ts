import fetchMock from 'fetch-mock';

import * as utils from './utils';

afterEach(() => {
  fetchMock.reset();
});

test('defaultFetcher', async () => {
  fetchMock.get('/api/test', {
    data: {
      foo: 'bar',
    },
  });

  const result = await utils.defaultFetcher('/api/test');

  expect(result).toEqual({
    foo: 'bar',
  });
});

test('getDownloadUrl', () => {
  expect(utils.getDownloadUrl('test.conf')).toBe('http://localhost/get-artifact/test.conf');
  expect(utils.getDownloadUrl('test.conf', false)).toBe('http://localhost/get-artifact/test.conf?dl=1');
  expect(utils.getDownloadUrl('test.conf', false, 'abcd')).toBe('http://localhost/get-artifact/test.conf?access_token=abcd&dl=1');
  expect(utils.getDownloadUrl('test.conf?foo=bar', false)).toBe('http://localhost/get-artifact/test.conf?foo=bar&dl=1');
});
