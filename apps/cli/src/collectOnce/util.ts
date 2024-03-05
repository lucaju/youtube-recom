import { crawlerConfig } from 'youtube-recommendation-crawler';
import type { Config } from '.';
import { log } from '../util/log';

const MAX_KEYWORDS = 5;

export const parseConfig = ({
  keywords,
  seeds = crawlerConfig.seeds.default,
  branches = crawlerConfig.branches.default,
  depth = crawlerConfig.depth.default,
  delay,
  ...rest
}: Config) => {
  if (keywords.length === 0) {
    log.warn('At least one keyword must be defined');
    return false;
  }

  if (keywords.length > MAX_KEYWORDS) {
    log.warn(`Limited to ${MAX_KEYWORDS} keywords`);
    keywords = keywords.slice(0, MAX_KEYWORDS);
  }

  keywords = keywords.filter((keyword: unknown, index: number) => {
    if (typeof keyword !== 'string') {
      log.warn(`A keyword must be a string. Keyword [${index}] is ${typeof keyword}`);
    }
    return typeof keyword === 'string';
  });

  if (seeds > crawlerConfig.seeds.max) {
    log.warn(`Limited to ${crawlerConfig.seeds.max} seeds`);
    seeds = crawlerConfig.seeds.max;
  }

  if (branches > crawlerConfig.branches.max) {
    log.warn(`Limited to ${crawlerConfig.branches.max} branches`);
    branches = crawlerConfig.branches.max;
  }

  if (depth > crawlerConfig.depth.max) {
    log.warn(`Limited to depth ${crawlerConfig.depth.max}`);
    depth = crawlerConfig.branches.max;
  }

  if (delay?.seed) delay.seed = delay.seed > 0 ? delay.seed : 0;
  if (delay?.video) delay.video = delay.video > 0 ? delay.video : 0;

  return { keywords, seeds, branches, depth, delay, ...rest };
};
