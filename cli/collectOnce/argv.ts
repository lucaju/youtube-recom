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
    keywords: {
      string: true,
      array: true,
      description: 'Define keywords to search. Multiple values separate with a space " "',
    },
    seeds: {
      number: true,
      description: 'Define the number of seed videos from the search',
      default: 2,
    },
    branches: {
      number: true,
      description: 'Define the number of recommendation branches to explores',
      default: 2,
    },
    depth: {
      number: true,
      description: 'Define the depth to explore',
      default: 2,
    },
    country: {
      string: true,
      description: 'Limit by country. Use contry code. eg. "CA"',
    },
    language: {
      string: true,
      description: 'Limit by language. Use language code. eg. "en-CA"',
    },
    verbose: {
      boolean: true,
      description: 'Verbose output',
    },
    silent: {
      boolean: true,
      description: 'Do not print result',
    },
  })
  .parseSync();
