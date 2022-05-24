import { blue, dim, green, magenta, white } from 'kleur';
import log from 'loglevel';
import { DateTime } from 'luxon';
import { Browser } from 'puppeteer';
import { launchPuppeteer } from './browser';
import Scraper from './scraper';
import type { ICrawlerConfig, IVideo } from './types';

export * from './types';

export const MAX_VALUES = {
  keywords: 10,
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

  values.keywords = values.keywords.filter((keyword: any, index: number) => {
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

export interface ICrawlerResult {
  date: DateTime;
  keyword: string;
  videos: IVideo[];
}

class Crawler {
  private readonly config: ICrawlerConfig;
  private readonly projectId?: string;

  private browser?: Browser;
  private startTime: DateTime;

  constructor(config: ICrawlerConfig, projectId?: string) {
    this.config = config;

    this.startTime = DateTime.now().setZone();
    this.projectId = projectId;
  }

  async collect() {
    this.browser = await launchPuppeteer();

    const startDate = DateTime.now();
    log.info(magenta(`Scraping Youtube Recommendations: ${dim(`${startDate}`)}\n`));

    const keywords = this.config.keywords;

    log.info(white('Keywords:'));
    log.info(blue(keywords.join(' | ')));

    const { seeds, branches, depth, country, language } = this.config;
    const data: ICrawlerResult[] = [];

    // * Each Keyword
    for (const keyword of keywords) {
      const scraper = new Scraper({
        browser: this.browser,
        keyword,
        seeds,
        branches,
        depth,
        country,
        language,
      });

      await scraper.collect();

      if (log.getLevel() <= log.levels.WARN) {
        log.warn(blue(`Summary ${keyword}`));
        console.table(scraper.videos, ['recommended', 'depth', 'title', 'views', 'likes']);
      }

      data.push({ date: this.startTime, keyword, videos: scraper.videos });
    }

    //done
    this.browser.close();

    const endDate = DateTime.now();
    const duration = endDate.diff(startDate, ['hours', 'minutes', 'seconds']);

    log.info(magenta(`\nDone at ${dim(`${endDate}`)}`));
    log.info(green(`(${duration.toHuman({ unitDisplay: 'short' })})`));
    log.info('\n');

    return data;
  }
}

export default Crawler;
