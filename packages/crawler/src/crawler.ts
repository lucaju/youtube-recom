import kleur from 'kleur';
import log from 'loglevel';
import * as emoji from 'node-emoji';
import ora, { type Ora } from 'ora';
import { TypedEventEmitter, disposeBrowser, getBrowser } from './components';
import { config } from './config';
import { searchPage, watchPage } from './pages';
import type { CrawlerConfig, CrawlerResult, Delay, Video, VideoBase } from './types';

export { config as crawlerConfig } from './config';
export * from './types';

interface LocalEventTypes {
  start: [{ message: string }];
  search: [{ message: string; data: VideoBase[] }];
  delay: [{ message: string; data: { counter: number; delay: number } }];
  scrape: [{ message: string; data: Video }];
  end: [{ message: string; data: CrawlerResult }];
}

export class Crawler extends TypedEventEmitter<LocalEventTypes> {
  private readonly seeds: number = config.seeds.default;
  private readonly branches: number = config.branches.default;

  private readonly delay: Required<Delay> = {
    seed: config.delay.seed.default,
    video: config.delay.video.default,
  };

  private readonly country?: string;
  private readonly language?: string;

  private readonly maxDepth: number = config.depth.default;
  private readonly spinner: Ora;

  private results: Map<string, CrawlerResult>;

  constructor({ seeds, branches, delay, depth, country, language }: CrawlerConfig = {}) {
    super();
    if (seeds) this.seeds = seeds < config.seeds.max ? seeds : config.seeds.max;
    if (branches) this.branches = branches < config.branches.max ? branches : config.branches.max;
    if (depth) this.maxDepth = depth < config.depth.max ? depth : config.depth.max;
    if (delay?.seed) {
      this.delay.seed = delay.seed < config.delay.seed.max ? delay.seed : config.delay.seed.max;
    }
    if (delay?.video) {
      this.delay.video =
        delay.video < config.delay.video.max ? delay.video : config.delay.video.max;
    }

    this.country = country;
    this.language = language;

    this.spinner = ora({
      spinner: 'dots',
      color: 'blue',
      stream: process.stdout,
      isSilent: log.getLevel() === 5,
    });

    log.info(kleur.magenta(`Youtube Recommendation Crawler\n`));

    log.info(
      kleur.blue(`Config:\n`),
      kleur.gray(`- seeds: ${seeds}\n`),
      kleur.gray(`- branches: ${this.branches}\n`),
      kleur.gray(`- depth: ${this.maxDepth}\n`),
      kleur.gray(`- delay:\n`),
      kleur.gray(`  - seed: ${this.delay.seed}\n`),
      kleur.gray(`  - video: ${this.delay.video}`),
    );

    this.results = new Map();
  }

  getConfig() {
    const config: CrawlerConfig = {
      seeds: this.seeds,
      branches: this.branches,
      depth: this.maxDepth,
      delay: {
        seed: this.delay.seed,
        video: this.delay.video,
      },
    };

    if (this.country) config.country = this.country;
    if (this.language) config.language = this.language;

    return config;
  }

  private async search(keyword: string) {
    const browser = await getBrowser();
    const { seeds, country, language } = this;

    this.spinner.start(`Searching for ${kleur.magenta(`${keyword}`)}`);
    const searchSeeds = await searchPage({ browser, keyword, seeds, country, language });
    this.spinner.stop();

    const searchMessage = `Seed videos for ${kleur.bgMagenta().black(`${keyword}`)}`;
    const seedTitles = searchSeeds.map(({ title }, index) => `${index + 1} - ${title}`);
    log.info(`${searchMessage}:
      ${kleur.magenta(seedTitles.join('\n'))}\n
    `);

    this.emit('search', {
      message: `${searchMessage}: ${seedTitles.join(' | ')}`,
      data: searchSeeds,
    });

    return searchSeeds;
  }

  /**
   * Collects data related to the given keyword by scraping YouTube recommendations.
   *
   * @param {string} keyword - The keyword to be collected
   * @return {Promise<CrawlerResult>} The collected data including videos and recommended videos
   */
  async collect(keyword: string) {
    //1. Initialize
    const startDate = new Date();
    this.results.set(keyword, { keyword, date: startDate, videos: [] });
    const result = this.results.get(keyword)!;

    const onStartMessage = `\n
    Collect start at: ${kleur.dim(`${startDate.toString()}`)}
    Searching for ${kleur.magenta(`${keyword}`)}
    \n`;
    log.info(kleur.magenta(onStartMessage));
    this.emit('start', { message: onStartMessage });

    //2. Search keywords for seed videos
    const searchSeeds = await this.search(keyword);

    //3. Get recommendations for seed videos
    let item = 0;
    for (const video of searchSeeds) {
      log.info(`Starting from ${kleur.bgMagenta().black(`${video.title}`)}`);
      await this.getRecommendationsFor(keyword, video);
      log.info('\n');

      if (this.delay.seed > 0 && item < searchSeeds.length - 1) {
        this.wait(this.delay.seed);
        log.info(kleur.dim(`Delay: ${this.delay.seed} seconds.\n`));
      }
      item++;
    }

    //Reorder by number of recommendations
    result.videos = this.rankVideos(result.videos);

    this.results.set(keyword, result);

    this.emit('end', {
      message: `End Crawling: ${result.videos.length} videos collected.`,
      data: result,
    });

    return result;
  }

  private rankVideos(videos: Video[]) {
    return videos.sort((a, b) => {
      if (a.crawlerResults!.recommended > b.crawlerResults!.recommended) return -1;
      if (b.crawlerResults!.recommended < a.crawlerResults!.recommended) return 1;
      return 0;
    });
  }

  private processPreviousWatchedVideo(video: Video, depth: number) {
    // Bump recommendation
    video.crawlerResults!.recommended = video.crawlerResults!.recommended + 1;

    //Bunp depth if was seen at a lower depth
    const seenAtLowerDepth = video.crawlerResults!.depth < depth;
    video.crawlerResults!.depth = Math.min(video.crawlerResults!.depth, depth);

    const depthLog = this.getDepthLog(depth);
    const lowerDepth = seenAtLowerDepth ? emoji.get('eyes') : '';
    const depthSignSeen = `${depthLog} ${lowerDepth}`;
    const bumpRecom = emoji.get('cookie');

    const scraperMessage = `${kleur.gray(`${depthSignSeen} | ${bumpRecom} ${video.id} |`)} ${video.title}`;
    log.info(scraperMessage);

    this.emit('scrape', {
      message: scraperMessage,
      data: video,
    });

    //return list of recommendations
    return video.recommendations?.slice(0, this.branches) ?? [];
  }

  private getDepthLog(depth: number) {
    return `${'----'.repeat(depth)}| ${depth}`;
  }

  //* Recursive function
  private async getRecommendationsFor(keyword: string, video: Video | VideoBase, depth = 0) {
    //0. Exit if max depth is reached
    if (depth > this.maxDepth) return [video];

    //1. Initialize
    const result = this.results.get(keyword)!;
    const { id, title } = video;

    //2. Check and process if video was watched
    const videoWatched = result.videos.find((video) => video.id === id);
    if (videoWatched) return this.processPreviousWatchedVideo(videoWatched, depth);

    //3. Prepare to scrape
    const depthLog = this.getDepthLog(depth);
    const spinnerMessage = `${kleur.gray(`${id} |`)} ${kleur.bold().blue(`${title}`)}`;
    this.spinner.prefixText = `${kleur.gray(`${depthLog}`)}`;

    //4. Check if it should delay and delay if need it
    this.spinner.start(spinnerMessage);
    if (this.delay.video > 0) {
      this.spinner.spinner = 'circleQuarters';
      this.spinner.text = `${spinnerMessage} | ${kleur.dim(`Delay: ${this.delay.video} seconds.\n`)}`;

      await this.wait(this.delay.video);

      this.spinner.spinner = 'dots';
      this.spinner.text = spinnerMessage;
    }

    //5. Scrape
    const videoInfo = await watchPage(video.id);
    videoInfo.crawlerResults = { collectedAt: new Date(), recommended: 1, depth };

    this.spinner.stop();

    const scrapeMessage = `${kleur.gray(`${depthLog} | ${id} |`)} ${title}`;
    log.info(scrapeMessage);
    this.emit('scrape', {
      message: scrapeMessage,
      data: videoInfo,
    });

    //6. Add to result
    result.videos.push(videoInfo);

    // 7. drill down on each branch
    let allRecommendations: (VideoBase | Video)[] = [];
    const currentVideoRecoms = videoInfo.recommendations?.slice(0, this.branches) ?? [];
    for (const recom of currentVideoRecoms) {
      const recommendations = await this.getRecommendationsFor(keyword, recom, depth + 1);
      allRecommendations = [...allRecommendations, ...recommendations];
    }

    //8. Return videos
    return allRecommendations;
  }

  async wait(delay = 0) {
    let counter = 0;
    const waitDelay = delay * 1000; //convert to milliseconds
    const increment = 1000; // 1 second

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        this.emit('delay', {
          message: `waiting: ${counter / 1000} of ${delay} seconds...`,
          data: { counter, delay },
        });
        counter += increment;
        if (counter > waitDelay) {
          clearInterval(timer);
          resolve(true);
        }
      }, increment);
      return timer;
    });
  }

  async dispose() {
    await disposeBrowser();
    this.removeAllListeners();
  }
}