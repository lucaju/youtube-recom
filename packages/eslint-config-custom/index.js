module.exports = {
  extends: [
    'next/core-web-vitals',
    'turbo',
    //* For more relaxed TS rules, uncommend next 2 lines and comment the following 2.
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/stylistic',
    // 'plugin:@typescript-eslint/recommended-type-checked',
    // 'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: [
    '**/coverage/**/*.*',
    '**/dist/**/*.*',
    '**/packages/eslint-*/*.js',
    '**/*.cjs',
    '**/*.js',
    '**/*.cts',
    '**/*.mts',
    '**/*.d.ts',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/ban-ts-comment': 1,
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/require-await': 0,
  },
  overrides: [
    {
      files: ['**/*.js'],
      extends: ['next/core-web-vitals', 'prettier'],
    },
    {
      env: { node: true },
      files: ['**/.eslintrc.{js,cjs}', '**/.jest-preset.js'],
      parserOptions: { sourceType: 'script' },
    },
    {
      files: ['**/*.md'],
      processor: 'markdown/markdown',
      plugins: ['markdown'],
      extends: [
        'eslint:recommended',
        // 'plugin:markdown/recommended',
        'prettier',
      ],
    },
    {
      files: ['**/*.md/*.ts'],
      rules: { strict: 'off' },
    },
    {
      env: { node: true },
      files: ['**/*.yml', '**/*.yaml'],
      extends: ['eslint:recommended', 'plugin:yml/standard', 'plugin:yml/prettier', 'prettier'],
      rules: { 'yml/no-empty-mapping-value': 0 },
    },
  ],
};
