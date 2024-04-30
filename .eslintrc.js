module.exports = {
  root: true,
  globals: {
    before: false,
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
    es2022: true
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
