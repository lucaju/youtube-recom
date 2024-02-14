const path = require('path');

const buildEslintCommand = (filenames) =>
  `npm run lint --fix --${filenames.map((f) => path.relative(process.cwd(), f)).join(' --')}`;

const buildPrettierCommand = (filenames) =>
  `prettier --write --ignore-unknown ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

module.exports = {
  '*.{js,mjs,ts}': [buildEslintCommand, buildPrettierCommand],
};
