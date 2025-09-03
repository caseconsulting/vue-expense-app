import vueEslintParser from "vue-eslint-parser";

export default [
  {
    files: ["**/*.js", "**/*.vue"],

    languageOptions: {
      parser: vueEslintParser, // must be the imported parser object
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        before: "readonly",
        defineProps: "readonly",
        defineEmits: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
      },
    },

    ignores: [
      "dist",
      "node_modules",
      "output.js",
      "tests/e2e/reports",
      "tests/unit/coverage",
      "tests/unit/reports",
    ],

    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "vue/multi-word-component-names": "off",
    },
  },
];
