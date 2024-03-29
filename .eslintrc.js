module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 9,
    sourceType: 'module'
  },
  globals: { before: false },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    '@vue/eslint-config-prettier',
    'plugin:vue/base',
    'plugin:vuetify/base'
  ],
  rules: {
    // allow console during development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow component names to be a single word
    'vue/multi-word-component-names': 'off'
  }
};
