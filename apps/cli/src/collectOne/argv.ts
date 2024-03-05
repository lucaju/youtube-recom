import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from '../../package.json';

export const argv = yargs(hideBin(process.argv))
  .usage('Youtube Recommendation Scraper\n\nUsage: $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('version', pkg.version)
  .alias('version', 'V')
  .options({
    id: {
      string: true,
      description: 'YouTube Video ID',
    },
    silent: {
      boolean: true,
      description: 'Do not print result',
    },
  })
  .parseSync();
