import fs from 'fs-extra';
import { log } from '../util/log';
import { argv } from './argv';
import { Inquerer } from './inquerer';
import { parseConfig } from './util';

export interface Config extends CrawlerConfig, CrawlerOptions {
  keywords: string[];
}

const configFile = 'config.json';

const initSetup = async () => {
  let config: Config;

  if (argv.keywords) {
    const { silent, verbose, ...argsconfig } = argv;
    config = {
      keywords: argv.keywords,
      seeds: argsconfig.seeds,
      branches: argsconfig.branches,
      depth: argsconfig.depth,
      delay: {
        video: argsconfig.delayVideo,
        seed: argsconfig.delaySeed,
      },
      country: argsconfig.country,
      language: argsconfig.language,
      logLevel: silent ? log.levels.SILENT : verbose ? log.levels.DEBUG : log.levels.INFO,
    };
    log.setLevel(silent ? log.levels.SILENT : verbose ? log.levels.DEBUG : log.levels.INFO);
  } else {
    const configFromFile = await fs.readJson(configFile).catch(() => null);
    config = configFromFile ?? (await Inquerer());
    if (!config.logLevel) config.logLevel = log.getLevel();
    log.setLevel(config.logLevel);
  }

  return config;
};

const saveToFile = async (results: CrawlerResult[]) => {
  const keywords = results.map(({ keyword }) => keyword);

  const result = {
    date: new Date(),
    keywords,
    results,
  };

  const folder = 'results';
  const file = `${keywords.join(',')}-${result.date.toDateString()}.json`;
  await fs.outputJson(`${folder}/${file}`, result, { spaces: 2 });
};

//Initial Setup
void (async () => {
  const config = await initSetup();
  const setup = parseConfig(config);
  if (!setup) return;

  const results: CrawlerResult[] = [];
  const crawler = new Crawler(setup);
  const results = await crawler(setup);

  for (const keyword of config.keywords) {
    const data = await crawler.collect(keyword);
    if (!data) continue;
    results.push(data);
  }

  await crawler.dispose();

  await saveToFile(results);

  log.info(results);
})();
