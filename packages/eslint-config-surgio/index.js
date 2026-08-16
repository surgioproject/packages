import js from '@eslint/js'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.es2020,
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      'array-bracket-spacing': 'off',
      'comma-dangle': 'off',
      'dot-notation': 'off',
      'valid-jsdoc': 'off',
      'no-unused-vars': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      eqeqeq: ['error', 'allow-null'],
    },
  },
]

export default config
export { config as 'module.exports' }
