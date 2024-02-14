module.exports = {
  root: true,
  extends: ['custom'],
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [
    {
      env: { node: true },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: { sourceType: 'script' },
    },
  ],
};
