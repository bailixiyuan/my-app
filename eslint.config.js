const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const prettier = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      '.env*',
      'package-lock.json',
      'yarn.lock',
      'public/**',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
