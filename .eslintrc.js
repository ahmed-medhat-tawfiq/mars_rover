module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-namespace': 0,
    'no-case-declarations': 0
  },
};
