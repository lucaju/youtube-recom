import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import {
  Crawler,
  CrawlerOptions,
  type CrawlerConfig,
  type CrawlerResult,
} from '../../src/index.ts';
import { log } from '../../src/util/log.ts';
import { argv } from './argv.ts';
import { Inquerer } from './inquerer.ts';
import { parseConfig } from './util.ts';

export interface Config extends CrawlerConfig, CrawlerOptions {
  keywords: string[];
}

const resultFolder = './results';
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
    const configFromFile = readFileSync(configFile, 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config = configFromFile ? (JSON.parse(configFromFile) as unknown as Config) : await Inquerer();
    if (!config.logLevel) config.logLevel = log.getLevel();
    log.setLevel(config.logLevel);
  }

  return config;
};

const saveToFile = async (results: CrawlerResult[]) => {
  const keywords = results.map(({ keyword }) => keyword);

  if (!existsSync(resultFolder)) mkdirSync(resultFolder);

  const result = {
    date: new Date(),
    keywords,
    results,
  };

  const file = `${keywords.join(',')}-${result.date.toDateString()}.json`;
  writeFileSync(`${resultFolder}/${file}`, JSON.stringify(result, null, 2));
};

//Initial Setup
void (async () => {
  const config = await initSetup();
  const setup = parseConfig(config);
  if (!setup) return;

  const { keywords, delay, logLevel, ...configCrawler } = config;

  const results: CrawlerResult[] = [];
  const crawler = new Crawler(configCrawler, { delay, logLevel });

  for (const keyword of keywords) {
    const data = await crawler.collect(keyword);
    if (!data) continue;
    results.push(data);
  }

  await crawler.dispose();

  await saveToFile(results);

  log.info(results);
})();
