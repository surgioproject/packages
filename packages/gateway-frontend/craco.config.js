'use strict';

const { ESLINT_MODES } = require('@craco/craco');
const pkg = require('./package.json');

process.env.REACT_APP_VERSION = pkg.version;

module.exports = {
  eslint: {
    mode: ESLINT_MODES.file,
  },
  plugins: [],
  style: {},
};
