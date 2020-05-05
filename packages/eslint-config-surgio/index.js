'use strict';

module.exports = {
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  rules: {
    'array-bracket-spacing': ['off'],
    'comma-dangle': ['off'],
    'dot-notation': ['off'],
    'valid-jsdoc': ['off'],
    'no-unused-vars': ['off'],
    eqeqeq: ['error', 'allow-null']
  },
};
