import { CronJob } from 'cron';
import fs from 'fs-extra';
import { yellow } from 'kleur';
import log from 'loglevel';
import { DateTime } from 'luxon';
import { Types } from 'mongoose';
import { EventEmitter } from 'stream';
import type { IRecommendedVideo, IVideo } from '../crawler';
import Crawler, { ICrawlerResult } from '../crawler/.';
import db, { IProjectStatus, IUser } from '../db';
import { ProjectModel, RecommendationModel, VideoModel, WatchedVideoModel } from '../db/models';
import type { ISchedule } from '../job';
import { composer, sendEmail } from '../server/email';
import jobPool from './pool';
import type { IJobConfig } from './types';

export * from './types';

export interface IJobCronEvent {
  jobId: string;
  status: Partial<IProjectStatus>;
}

class Job extends EventEmitter {
  private readonly _id: string;
  private readonly createdAt: DateTime;
  private readonly schedule: ISchedule;

  private modifiedAt: DateTime;
  private _active = false;
  private useDB = false;
  private saveOnFile = false;

  private cron: CronJob;
  private crawler: Crawler;

  constructor(id: string, config: IJobConfig) {
    super();
    this._id = id;
    this.createdAt = DateTime.now();
    this.modifiedAt = this.createdAt;

    // config
    this.schedule = config.schedule;
    this.saveOnFile = config.storage?.saveOnFile ?? false;
    this.useDB = config.storage?.useDB ?? false;

    //crawler
    this.crawler = new Crawler(config.crawler, id);

    //cron
    this.cron = new CronJob({
      cronTime: `* * ${this.schedule.hour} * * *`,
      // cronTime: `0 * * * * *`,
      onTick: async () => {
        await this.crawl();
      },
      timeZone: this.schedule.timezone,
    });
  }

  get id() {
    return this._id;
  }

  get active() {
    return this._active;
  }

  get status() {
    return {
      active: this._active,
      lastDate: this.cron.lastDate(),
      modifiedAt: this.modifiedAt,
      nextDates: this.cron.nextDates(),
      running: this.cron.running ?? false,
    };
  }

  start() {
    if (!jobPool.hasActiveSlot) return false;

    this.cron.start();
    this._active = true;
    this.modifiedAt = DateTime.now();
    return this.status;
  }

  stop() {
    this.cron.stop();
    this._active = false;
    this.modifiedAt = DateTime.now();

    return this.status;
  }

  dispose() {
    this.stop();
    jobPool.removeJob(this.id);
  }

  private async crawl() {
    this.emit('job:cron:tick', {
      jobId: this.id,
      status: { running: true },
    });

    if (this.useDB) {
      const collectedToday = await this.hasCollectedToday().catch((error) => {
        log.error(error);
        jobPool.removeJob(this.id);
        this.stop();
      });

      if (collectedToday === true) {
        this.crawlCompleted();
        return;
      }
    }

    const data = await this.crawler.collect();

    if (this.useDB) {
      await this.save(data);
      await this.notify(data);
    }

    if (this.saveOnFile) await this.saveToFile(data);

    this.crawlCompleted();
  }

  private crawlCompleted() {
    this.emit('job:cron:completed', {
      jobId: this.id,
      status: {
        running: false,
        lastDate: this.cron.lastDate(),
        nextDate: this.cron.nextDate().toJSDate(),
      },
    });
  }

  private async hasCollectedToday() {
    const collectedToday = await ProjectModel.hasCollectedToday(this.id).catch((error) => {
      throw error;
    });

    if (collectedToday) {
      const project = await ProjectModel.findById(this.id);
      log.info(
        `Recommendation for the ${yellow(
          `${project?.title ?? this.id}`
        )} was already collected today`
      );
    }
    return collectedToday;
  }

  private async save(results: ICrawlerResult[]) {
    await db.connect();

    for (const result of results) {
      await this.saveCollection(result);
    }

    await ProjectModel.findByIdAndUpdate(this.id, { lastCrawledAt: this.cron.lastDate() });
  }

  private async saveCollection({ date, keyword, videos }: ICrawlerResult) {
    const isRecommendedToday = await RecommendationModel.collectedKeywordAt(
      this.id,
      keyword,
      date.toBSON()
    );
    if (isRecommendedToday) return;

    await RecommendationModel.create({
      project: this.id,
      date: date.toBSON(),
      keyword,
      videos,
    });

    //save Videos
    for (const video of videos) {
      await this.saveVideo(keyword, video);
    }
  }

  private async saveVideo(keyword: string, video: IVideo) {
    const isWatched = await WatchedVideoModel.isWatchedToday(
      this.id,
      keyword,
      video.ytId,
      video.collectedAt
    );
    if (isWatched) return;

    const ytVideo = await VideoModel.findOne({ ytId: video.ytId });
    if (!ytVideo) await this.saveVideoToDB(video);

    //Save Watched Videos
    await this.saveWatchedVideo(keyword, video);
  }

  private async saveVideoToDB(video: IVideo) {
    const {
      ytId,
      title,
      description,
      duration,
      hastags,
      uploadDate,
      datePublished,
      paid,
      channel,
    } = video;

    return await VideoModel.create({
      project: this.id,
      ytId,
      title,
      description,
      duration,
      hastags: hastags as Types.Array<string>,
      uploadDate,
      datePublished,
      paid,
      channel,
    });
  }

  private async saveWatchedVideo(keyword: string, video: IVideo) {
    const { ytId, title, collectedAt, views, likes, comments, depth, recommended, recomendations } =
      video;

    return await WatchedVideoModel.create({
      ytId,
      title,
      keyword,
      date: collectedAt,
      views: views ?? -1,
      likes: likes ?? -1,
      comments: comments ?? -1,
      depth,
      recommended,
      recommendations: recomendations as Types.DocumentArray<IRecommendedVideo>,
    });
  }

  // * Saving file

  private async saveToFile(results: ICrawlerResult[]) {
    const keyword = results.map(({ keyword }) => keyword);
    const data = results.map(({ keyword, date, videos }) => {
      return {
        keyword,
        date: date.toISO(),
        videos,
      };
    });

    const folder = 'results';
    const file = `${keyword.join('_')}-${Date.now()}.json`;
    await fs.outputJson(`${folder}/${file}`, data, { spaces: 2 });
  }

  // * Notify
  private async notify(data: ICrawlerResult[]) {
    const project = await ProjectModel.findById(this.id).populate<{ owner: IUser }>({
      path: 'owner',
      select: ['name', 'email'],
    });
    if (!project) return;

    const body = composer({
      title: project.title,
      date: DateTime.now(),
      results: data,
    });

    await sendEmail({ recipient: project.owner, body });
  }
}

export default Job;
