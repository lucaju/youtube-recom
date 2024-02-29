import fs from 'fs-extra';
import kleur from 'kleur';
import log from 'loglevel';
import {
  crawler,
  parseCrawlerValues,
  type ICrawlerConfig,
  type ICrawlerResult,
  type IVideo,
} from 'youtube-recommendation-crawler';
import { argv } from './argv';
import { Inquerer } from './inquerer';

const configFile = 'config.json';

const initSetup = async () => {
  let config: ICrawlerConfig;
  let loglevel: log.LogLevelDesc = 'INFO';

  if (argv.keywords) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _, ['$0']: removedProperty, ...args } = argv;
    const { silent, verbose, ...agsconfig } = args;
    console.log(agsconfig);
    config = agsconfig as ICrawlerConfig;
    loglevel = silent ? 'SILENT' : verbose ? 'INFO' : 'WARN';
  } else {
    const configFromFile = (await fs
      .readJson(configFile)
      .catch(() => null)) as ICrawlerConfig | null;
    if (configFromFile) {
      config = configFromFile;
    } else {
      const { loglevel: _loglevel, ...args } = await Inquerer();
      config = { ...args, keywords: args.keywords.split(',') };
      loglevel = _loglevel === 'silent' ? 'SILENT' : _loglevel === 'results' ? 'WARN' : 'INFO';
    }
  }

  log.setLevel(loglevel);

  return config;
};

const saveToFile = async function (results: ICrawlerResult[]) {
  const keywords = results.map(({ keyword }) => keyword);
  const data = results.map(({ keyword, date, videos }) => ({
    keyword,
    date: date.toISO(),
    videos,
  }));

  const result = {
    date: new Date(),
    keywords,
    results: data,
  };

  const folder = 'results';
  const file = `${keywords.join(',')}-${result.date.toDateString()}.json`;
  await fs.outputJson(`${folder}/${file}`, result, { spaces: 2 });
};

//Initial Setup
void (async () => {
  const config = await initSetup();
  const setup = parseCrawlerValues(config);
  if (!setup) return;

  const results = await crawler(setup);

  await saveToFile(results);

  const dataTransform: { date: string; keyword: string; videos: IVideo[] }[] = [];
  results.forEach(({ date, keyword, videos }) => {
    dataTransform.push({
      date: date.toISO() ?? '',
      keyword,
      videos,
    });
  });

  log.warn(kleur.blue('Result'));
  log.warn(dataTransform);
})();
