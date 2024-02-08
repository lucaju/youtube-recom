import kleur, { gray, magenta, red } from 'kleur';
import log from 'loglevel';
import * as emoji from 'node-emoji'
import ora, { Ora } from 'ora';
import { Browser } from 'puppeteer';
import { emitIo } from '../../server/socket';
import type { IRecommendedVideo, IVideo } from '../types';
import { searchPage } from './search';
import { watchPage } from './watch';

export { watchPage } from './watch';

export interface IScraperParams {
  browser: Browser;
  keyword: string;
  seeds?: number;
  branches?: number;
  depth?: number;
  country?: string;
  language?: string;
}

class Scraper {
  private readonly browser;
  private readonly keyword: string;

  private readonly seeds: number = 1;
  private readonly branches: number = 1;
  private readonly country?: string;
  private readonly language?: string;
  private readonly maxDepth: number = 1;
  private readonly spinner: Ora;
  private readonly timezone?: string;

  recommendedVideos: IRecommendedVideo[];
  videos: IVideo[];

  constructor(params: IScraperParams) {
    const { browser, keyword, seeds, branches, depth, country, language } = params;

    this.browser = browser;
    this.keyword = keyword;

    if (seeds) this.seeds = seeds;
    if (branches) this.branches = branches;
    if (depth) this.maxDepth = depth;
    this.country = country;
    this.language = language;

    this.spinner = ora({
      spinner: 'dots',
      color: 'blue',
      stream: process.stdout,
      isSilent: log.getLevel() >= 3,
    });

    this.recommendedVideos = [];
    this.videos = [];
  }

  async collect() {
    log.info('\n');

    this.spinner.start(`Searching for ${magenta(`${this.keyword}`)}`);
    const { browser, keyword, seeds, country, language } = this;
    const searchProject = await searchPage({ browser, keyword, seeds, country, language });
    this.spinner.stop();
    if (!searchProject) return;

    log.info(`Seed videos for ${kleur.bgMagenta().black(`${this.keyword}`)}`);
    const seedTitles = searchProject.map(({ title }, index) => `${index + 1} - ${title}`);
    log.info(magenta(seedTitles.join('\n')));
    log.info('\n');

    for (const video of searchProject) {
      log.info(`Starting from ${kleur.bgMagenta().black(`${video.title}`)}`);
      const recommendations = await this.getRecommendationsFor(video);
      this.recommendedVideos = [...this.recommendedVideos, ...recommendations];
      log.info('\n');
    }

    //Reorder by number of recommendations
    this.videos = this.videos.sort((a, b) => {
      if (a.recommended > b.recommended) return -1;
      if (b.recommended < a.recommended) return 1;
      return 0;
    });

    return this.recommendedVideos;
  }

  //* Recursive function
  private async getRecommendationsFor(video: IVideo | IRecommendedVideo, depth = 0) {
    const { ytId, title } = video;
    if (depth > this.maxDepth) return [video];

    const depthSign = `${'----'.repeat(depth)}| ${depth}`;

    let videoInfo = this.getVideo(ytId);

    if (videoInfo) {
      videoInfo.recommended = videoInfo.recommended + 1;

      const seenAtLowerDepth = videoInfo.depth < depth;
      videoInfo.depth = Math.min(videoInfo.depth, depth);

      const lowerDepth = seenAtLowerDepth ? emoji.get('eyes') : '';
      const depthSignSeen = `${depthSign} ${lowerDepth} |`;
      const bumpRecom = emoji.get('cookie');

      log.info(`${gray(`${depthSignSeen} ${bumpRecom} ${ytId} |`)} ${title}`);
      emitIo('crawlerEvent', {
        msg: `${depthSignSeen} ${bumpRecom} ${ytId} | ${title}`,
      });

      return videoInfo.recommendations?.slice(0, this.branches) ?? [];
    }

    this.spinner.prefixText = `${gray(`${depthSign}`)}`;
    this.spinner.start(`${gray(`${ytId} |`)} ${kleur.bold().blue(`${title}`)}`);

    videoInfo = await watchPage({
      browser: this.browser,
      branches: this.branches,
      timezone: this.timezone,
      ytId: video.ytId,
    });

    this.spinner.stop();

    if (!videoInfo) {
      log.info(`${gray(`${depthSign} | ${ytId} |`)} ${emoji.get('x')} ${red(`${title}`)}`);
      emitIo('crawlerEvent', {
        msg: `${depthSign} | ${ytId} | ${emoji.get('x')} ${title}`,
      });
      return [];
    }

    log.info(`${gray(`${depthSign} | ${ytId} |`)} ${title}`);
    emitIo('crawlerEvent', {
      msg: `${depthSign} | ${ytId} | ${title}`,
    });

    videoInfo.depth = depth;
    this.videos.push(videoInfo);

    // drill down on each branch
    let allRecommendations: (IRecommendedVideo | IVideo)[] = [];
    const currentVideoRecoms = videoInfo.recommendations?.slice(0, this.branches) ?? [];

    for (const recom of currentVideoRecoms) {
      const recommendations = await this.getRecommendationsFor(recom, depth + 1);
      allRecommendations = [...allRecommendations, ...recommendations];
    }

    return allRecommendations;
  }

  private getVideo = (id: string) => {
    const video = this.videos.find((video: IVideo) => video.ytId === id);
    return video;
  };
}

export default Scraper;
