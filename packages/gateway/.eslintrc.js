const { join } = require('path');

module.exports = {
  root: true,
  extends: [join(__dirname, '../../.eslintrc.base.js')],
  parserOptions: {
    project: join(__dirname, 'tsconfig.eslint.json'),
    sourceType: 'module',
  },
  rules: {},
};
