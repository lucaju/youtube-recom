// const env = require('./.env-cmdrc');

module.exports = {
  apps: [
    {
      name: 'youtube-scraper',
      script: 'ts-node ./server/index.ts',
      args: '--no-daemon',
      // env: env.production,
    },
  ],
};
