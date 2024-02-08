import fs, { readJson } from 'fs-extra';
import { blue } from 'kleur';
import log from 'loglevel';
import type { ICrawlerConfig, ICrawlerResult, IVideo } from '../../crawler';
import { crawler, parseCrawlerValues } from '../../crawler';
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
  const file = `${keywords.join(',')}-${result.date}.json`;
  await fs.outputJson(`${folder}/${file}`, result, { spaces: 2 });
};

//Initial Setup
(async () => {
  const setup = parseCrawlerValues(await initSetup());
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

  log.warn(blue('Result'));
  log.warn(dataTransform);
})();
