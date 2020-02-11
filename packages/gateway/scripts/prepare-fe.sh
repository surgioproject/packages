#!/usr/bin/env bash

set -eux

(
  cd ../gateway-frontend \
  && npm run build
)

if [ -d ./public ];
then
  rm -r ./public
fi

mv ../gateway-frontend/build ./public
