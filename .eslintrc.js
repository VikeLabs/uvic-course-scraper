module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-extra-boolean-cast': 'error',
    'no-extra-semi': 'error',
    'no-extra-semi': 'error',
    'no-regex-spaces': 'error',
    'array-callback-return': 'error',
  },
};
