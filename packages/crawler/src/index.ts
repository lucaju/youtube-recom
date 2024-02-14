import kleur from 'kleur';
import log from 'loglevel';
import { DateTime } from 'luxon';
import { launchPuppeteer } from './browser';
import Scraper from './scraper';
import type { ICrawlerConfig, ICrawlerResult } from './types';

export { launchPuppeteer } from './browser';
export { watchPage } from './scraper';
export * from './types';

export const MAX_VALUES = {
  keywords: 5,
  seeds: 5,
  branches: 5,
  depth: 5,
};

export const parseCrawlerValues = (values: ICrawlerConfig) => {
  if (values.keywords.length === 0) {
    log.warn('At least one keyword must be defined');
    return false;
  }

  if (values.keywords.length > MAX_VALUES.keywords) {
    log.warn(`Limited to ${MAX_VALUES.keywords} keywords`);
    values.keywords = values.keywords.slice(0, MAX_VALUES.keywords);
  }

  values.keywords = values.keywords.filter((keyword: unknown, index: number) => {
    if (typeof keyword !== 'string') {
      log.warn(`A keyword must be a string. Keyword [${index}] is ${typeof keyword}`);
    }
    return typeof keyword === 'string';
  });

  if (values.seeds > MAX_VALUES.seeds) {
    log.warn(`Limited to ${MAX_VALUES.seeds} seeds`);
    values.seeds = MAX_VALUES.seeds;
  }

  if (values.branches > MAX_VALUES.branches) {
    log.warn(`Limited to ${MAX_VALUES.branches} branches`);
    values.branches = MAX_VALUES.branches;
  }

  if (values.depth > MAX_VALUES.depth) {
    log.warn(`Limited to depth ${MAX_VALUES.depth}`);
    values.depth = MAX_VALUES.branches;
  }

  return values;
};

export const crawler = async (config: ICrawlerConfig) => {
  const { keywords, seeds, branches, depth, country, language } = config;

  const startTime = DateTime.now().setZone();
  const browser = await launchPuppeteer();

  const startDate = DateTime.now();
  log.info(
    kleur.magenta(`Scraping Youtube Recommendations: ${kleur.dim(`${startDate.toString()}`)}\n`),
  );

  log.info(kleur.white('Keywords:'));
  log.info(kleur.blue(keywords.join(' | ')));

  const data: ICrawlerResult[] = [];

  // * Each Keyword
  for (const keyword of keywords) {
    const scraper = new Scraper({ browser, keyword, seeds, branches, depth, country, language });

    await scraper.collect();

    if (log.getLevel() <= log.levels.WARN) {
      log.warn(kleur.blue(`Summary ${keyword}`));
      console.table(scraper.videos, ['recommended', 'depth', 'title', 'views', 'likes']);
    }

    data.push({ date: startTime, keyword, videos: scraper.videos });
  }

  //done
  await browser.close();

  const endDate = DateTime.now();
  const duration = endDate.diff(startDate, ['hours', 'minutes', 'seconds']);

  log.info(kleur.magenta(`\nDone at ${kleur.dim(`${endDate.toString()}`)}`));
  log.info(kleur.green(`(${duration.toHuman({ unitDisplay: 'short' })})`));
  log.info('\n');

  return data;
};
