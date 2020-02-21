'use strict';

const nock = require('nock');
const fs = require('fs');
const path = require('path');

const scope = nock('http://example.com')
  .get(/\/gui-config\.json/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/gui-config-1.json'), {
      encoding: 'utf8',
    })
  )
  .get(/\/test-ss-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ss-sub.txt'), {
      encoding: 'utf8',
    })
  )
  .get(/\/test-ssr-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ssr-sub.txt'), {
      encoding: 'utf8',
    })
  )
  .get(/\/test-v2rayn-sub\.txt/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-v2rayn-sub.txt'), {
      encoding: 'utf8',
    })
  )
  .get(/\/netflix\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/netflix.list'), {
      encoding: 'utf8',
    })
  )
  .get(/\/telegram\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/telegram.list'), {
      encoding: 'utf8',
    })
  )
  .get(/\/clash-sample\.yaml/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/clash-sample.yaml'), {
      encoding: 'utf8',
    })
  )
  .get(/\/test-ruleset\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/test-ruleset-1.list'), {
      encoding: 'utf8',
    })
  )
  .get(/\/ForeignMedia\.list/)
  .reply(
    200,
    fs.readFileSync(path.join(__dirname, 'assets/ForeignMedia.list'), {
      encoding: 'utf8',
    })
  )
  .get(/\/error/)
  .reply(
    500,
    ''
  );

scope.persist();
