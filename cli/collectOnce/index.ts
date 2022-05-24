import { readJson } from 'fs-extra';
import { blue } from 'kleur';
import log from 'loglevel';
import type { ICrawlerConfig, IVideo } from '../../crawler';
import Crawler, { parseCrawlerValues } from '../../crawler';
import { argv } from './argv';
import { Inquerer } from './inquerer';

const configFile = 'config_collect_once.json';

const initSetup = async () => {
  let config: ICrawlerConfig;
  let loglevel: log.LogLevelDesc = 'INFO';

  if (argv.keywords) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _, ['$0']: removedProperty, ...args } = argv;
    config = Object.assign({ ...args });
    loglevel = argv.silent ? 'SILENT' : argv.verbose ? 'INFO' : 'WARN';
  } else {
    const configFromFile = await readJson(configFile).catch(() => null);
    if (configFromFile) {
      config = configFromFile;
    } else {
      const args = await Inquerer();
      config = Object.assign({ ...args, keywords: args.keywords.split(',') });
      loglevel =
        args.loglevel === 'silent' ? 'SILENT' : args.loglevel === 'results' ? 'WARN' : 'INFO';
    }
  }

  log.setLevel(loglevel);

  return config;
};

//Initial Setup
(async () => {
  const setup = parseCrawlerValues(await initSetup());
  if (!setup) return;

  const project = new Crawler(setup);
  const results = await project.collect();

  const dataTransform: { date: string; keyword: string; videos: IVideo[] }[] = [];
  results.forEach((data) => {
    const date = data.date.toISO();
    const _data = { date, keyword: data.keyword, videos: data.videos };
    dataTransform.push(_data);
  });

  log.warn(blue('Result'));
  log.warn(dataTransform);
})();
