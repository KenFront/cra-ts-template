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
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
