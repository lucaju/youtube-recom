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
    queries: {
      string: true,
      array: true,
      description: 'Define queries to search.',
    },
    searches: {
      number: true,
      description: 'Define the number of seed videos from the search',
      default: 4,
    },
    branch: {
      number: true,
      description: 'Define the number of recommendation branches to explores',
      default: 4,
    },
    depth: {
      number: true,
      description: 'Define the depth to explore',
      default: 4,
    },
    gl: {
      string: true,
      description: 'Limit by country. Use contry code. eg. "CA"',
    },
    language: {
      string: true,
      description: 'Limit by language. Use language code. eg. "en-CA"',
    },
    hour: {
      number: true,
      description:
        'This scrits runs once a day. What time (hour) it should be scheduled? Use language [0-23]',
      default: 20,
    },
    timezone: {
      string: true,
      description:
        '`Specify the timezone for the execution. This will modify the actual time relative to your timezone. If the timezone is invalid, an error is thrown. You can check all timezones available at Luxon Timezone Website.',
      default: '',
    },
  }).argv;
