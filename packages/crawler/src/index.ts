import kleur from 'kleur';
import log from 'loglevel';
import { DateTime } from 'luxon';
import { launchPuppeteer } from './browser';
import Scraper from './scraper';
import type { CrawlerConfig, CrawlerResult } from './types';

export { launchPuppeteer } from './browser';
export { watchPage } from './scraper';
export * from './types';

export const MAX_VALUES = {
  keywords: 5,
  seeds: 5,
  branches: 5,
  depth: 5,
};

export const crawler = async (config: CrawlerConfig) => {
  const { keywords, seeds, branches, depth, country, language } = config;

  const startTime = DateTime.now().setZone();
  const browser = await launchPuppeteer();

  const startDate = DateTime.now();
  log.info(
    kleur.magenta(`Scraping Youtube Recommendations: ${kleur.dim(`${startDate.toString()}`)}\n`),
  );

  log.info(kleur.white('Keywords:'));
  log.info(kleur.blue(keywords.join(' | ')));

  const data: CrawlerResult[] = [];

  // * Each Keyword
  for (const keyword of keywords) {
    const scraper = new Scraper({ browser, keyword, seeds, branches, depth, country, language });

    await scraper.collect();

    if (log.getLevel() <= log.levels.WARN) {
      log.warn(kleur.blue(`Summary ${keyword}`));
      console.table(scraper.videos, ['recommended', 'depth', 'title', 'views', 'likes']);
    }

    data.push({
      date: startTime,
      keyword,
      videos: scraper.videos,
    });
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
