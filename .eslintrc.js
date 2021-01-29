const { rules } = require('eslint-plugin-jsx-a11y');
const isProd = process.env.NODE_ENV === 'production';
module.exports = {
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'react-app',
    'react-app/jest',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-curly-newline': 'off',
    'no-console': isProd ? ['error', { allow: ['warn', 'error'] }] : 'off',
    '@typescript-eslint/indent': 'off',
    ...Object.keys(rules).reduce(
      (obj, key) => ({
        ...obj,
        [`jsx-a11y/${key}`]: 'off',
      }),
      {},
    ),
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
