module.exports = {
  root: true,
  extends: ['custom'],
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ['.eslintrc.cjs'],
  overrides: [
    {
      env: { node: true },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: { sourceType: 'script' },
    },
  ],
};
