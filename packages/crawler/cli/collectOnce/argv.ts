import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from '../../package.json' with { type: 'json' };

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
    delayVideo: {
      number: true,
      description: 'Delay scraper for each video in seconds',
      default: 0,
    },
    delaySeed: {
      number: true,
      description: 'Delay scraper for each seed video in seconds',
      default: 0,
    },
    country: {
      string: true,
      description: 'Limit by country. Use contry code. eg. "CA"',
    },
    language: {
      string: true,
      description: 'Limit by language. Use language code. eg. "en-CA"',
    },
    saveOnFile: {
      boolean: true,
      description: 'Save results on file',
    },
    silent: {
      boolean: true,
      description: 'Do not print result',
    },
  })
  .parseSync();
