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
  jest: {
    configure: (jestConfig, { env, paths, resolve, rootDir }) => {
      jestConfig.transformIgnorePatterns = ["node_modules/(?!@axios)/"]
      jestConfig.moduleNameMapper = {
        '^@/(.*)$': '<rootDir>/src/$1',
      }
      return jestConfig;
    },
  }
};

module.exports = config;
