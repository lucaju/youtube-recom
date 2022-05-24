import { readJson } from 'fs-extra';
import log from 'loglevel';
import { parseCrawlerValues } from '../../crawler';
import type { IJobConfig } from '../../job';
import JobPool from '../../job/pool';
import { argv } from './argv';
import { Inquerer } from './inquerer';

const configFile = '_config_collect_cron.json';

const parseCrawlerOptions = (args: any) => {
  return parseCrawlerValues({
    keywords: args.keywords,
    seeds: args.seeds,
    branches: args.branches,
    depth: args.depth,
    country: args.keywords,
    language: args.keywords,
  });
};

const parseSchedulerOptions = (args: any) => {
  return {
    hours: args.hour,
    timezone: args.timezone,
  };
};

const initSetup = async () => {
  let config: IJobConfig;
  let loglevel: log.LogLevelDesc = 'INFO';

  if (argv.keywords) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _, ['$0']: removedProperty, ...args } = argv;
    config = Object.assign({
      crawler: parseCrawlerOptions(argv),
      schedule: parseSchedulerOptions(argv),
      storage: {
        saveOnFile: argv.saveOnFile ?? false,
        useDB: argv.useDB ?? false,
      },
    });
    loglevel = argv.silent ? 'SILENT' : argv.verbose ? 'INFO' : 'WARN';
  } else {
    const configFromFile = await readJson(configFile).catch(() => null);
    if (configFromFile) {
      config = configFromFile;
    } else {
      const args = await Inquerer();
      args.keywords = args.keywords.split(',');
      config = Object.assign({
        crawler: parseCrawlerOptions(args),
        schedule: parseSchedulerOptions(args),
        storage: {
          saveOnFile: args.storage?.includes('onFile') ? true : false,
          useDB: args.storage?.includes('useDB') ? true : false,
        },
      });
      loglevel =
        args.loglevel === 'silent' ? 'SILENT' : args.loglevel === 'results' ? 'WARN' : 'INFO';
    }
  }

  log.setLevel(loglevel);
  return config;
};

(async () => {
  const setup = await initSetup();
  if (!setup.crawler) return `Crawler undefined. Please check documentation.`;
  if (!setup.schedule) return `Schedule undefined. Please check documentation.`;

  const job = JobPool.createJob('_', setup);
  job.start();

  log.warn(`Starts at: ${job.status.nextDates}`);
})();
