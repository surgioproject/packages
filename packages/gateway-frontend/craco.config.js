'use strict';

const pkg = require('./package.json');

process.env.REACT_APP_VERSION = pkg.version;

/**
 * @type {import('@craco/types').CracoConfig}
 */
const config = {
  eslint: {
    enable: true,
    mode: 'file',
  },
  plugins: [],
  style: {
    postcss: {
      mode: 'file',
    }
  },
  webpack: {
    alias: {
      '@': `${__dirname}/src`,
    },
  },
};

module.exports = config;
