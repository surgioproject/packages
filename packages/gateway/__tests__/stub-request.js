'use strict';

const nock = require('nock');
const fs = require('fs');
const path = require('path');

let counter1 = 0;

const scope = nock('http://example.com')
  .get(/\/gui-config\.json/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/gui-config-1.json'), {})
  )
  .get(/\/test-ss-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ss-sub.txt'), {})
  )
  .get(/\/test-ss-sub-user-info\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ss-sub.txt'), {}),
    {
      'subscription-userinfo':
        'upload=891332010; download=29921186546; total=322122547200; expire=1586330887',
    }
  )
  .get(/\/test-ssr-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ssr-sub.txt'), {})
  )
  .get(/\/test-v2rayn-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-v2rayn-sub.txt'), {})
  )
  .get(/\/netflix\.list/)
  .reply(200, fs.readFileSync(path.join(__dirname, 'assets/netflix.list'), {}))
  .get(/\/telegram\.list/)
  .reply(200, fs.readFileSync(path.join(__dirname, 'assets/telegram.list'), {}))
  .get(/\/clash-sample\.yaml/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/clash-sample.yaml'), {})
  )
  .get(/\/clash-sample-error-after-first\.yaml/)
  .reply(() => {
    const res = fs.readFileSync(
      path.join(__dirname, 'assets/clash-sample.yaml'),
      {}
    );

    counter1++;

    if (counter1 > 2) {
      return [500];
    } else {
      return [200, res];
    }
  })
  .get(/\/test-ruleset\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ruleset-1.list'), {})
  )
  .get(/\/ForeignMedia\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/ForeignMedia.list'), {})
  )
  .get(/\/error/)
  .reply(500, '');

scope.persist();
