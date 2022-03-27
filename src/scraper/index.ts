import fs from 'fs-extra';
import kleur, { gray, magenta, red } from 'kleur';
import { Types } from 'mongoose';
import emoji from 'node-emoji';
import ora from 'ora';
import { config } from '../config';
import { dbConnected } from '../db';
import * as YTRecommendations from '../db/routes/YTRecommendations';
import * as YTVideo from '../db/routes/YTVideo';
import * as YTVideoWatched from '../db/routes/YTVideoWatched';
import type { IVideo, IVideoRecommended, IYTvideo, IYTvideoWatched } from '../types';
import { searchResults } from './search';
import { watchPage } from './watch';

const spinner = ora({ spinner: 'dots', color: 'blue', stream: process.stdout });

class Scraper {
  readonly name: string;
  readonly branching: number;
  readonly date: string;
  readonly maxDepth: number;

  recommendedVideos: any[];
  videos: IVideo[];

  constructor(keyword: string) {
    this.name = keyword;
    this.branching = config.branch ?? 1;
    this.maxDepth = config.depth ?? 1;

    const now = new Date();
    //round date to the hour
    this.date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}:00`;

    this.recommendedVideos = [];
    this.videos = [];
  }

  async collect() {
    console.log('\n');

    spinner.start(`Searching for ${magenta(`${this.name}`)}`);
    const searchCollection = await searchResults(this.name);
    spinner.stop();

    console.log(`Seed videos for ${kleur.bgMagenta().black(`${this.name}`)}`);
    const seedTitles = searchCollection.map(({ title }, index) => `${index + 1} - ${title}`);
    console.log(magenta(seedTitles.join('\n')));
    console.log('\n');

    for (const video of searchCollection) {
      console.log(`Starting from ${kleur.bgMagenta().black(`${video.title}`)}`);
      const recommendations = await this.getReccommendationsFor(video);
      this.recommendedVideos = [...this.recommendedVideos, ...recommendations];
      console.log('\n');
    }

    //Reorder by number of recomendations
    this.videos = this.videos.sort((a, b) => {
      if (a.recommended > b.recommended) return -1;
      if (b.recommended < a.recommended) return 1;
      return 0;
    });

    return this.recommendedVideos;
  }

  //* Recursive function
  private async getReccommendationsFor(video: IVideo | IVideoRecommended, depth = 0) {
    const { id, title } = video;
    if (depth > this.maxDepth) return [video];

    const depthSign = `${'----'.repeat(depth)}| ${depth}`;

    let videoInfo = this.getVideo(id);

    if (videoInfo) {
      videoInfo.recommended = videoInfo.recommended + 1;

      const seenAtLowerDepth = videoInfo.depth < depth;
      videoInfo.depth = Math.min(videoInfo.depth, depth);

      const lowerDepth = seenAtLowerDepth ? emoji.get('eyes') : '';
      const depthSignSeen = `${depthSign} ${lowerDepth} |`;
      const bumpRecom = emoji.get('cookie');

      console.log(`${gray(`${depthSignSeen} ${bumpRecom} ${id} |`)} ${title}`);

      return videoInfo.recomendations?.slice(0, this.branching) ?? [];
    }

    spinner.prefixText = `${gray(`${depthSign}`)}`;
    spinner.start(`${gray(`${id} |`)} ${kleur.bold().blue(`${title}`)}`);

    videoInfo = await watchPage(video);

    spinner.stop();

    if (!videoInfo) {
      console.log(`${gray(`${depthSign} | ${id} |`)} ${emoji.get('x')} ${red(`${title}`)}`);
      return [];
    }

    console.log(`${gray(`${depthSign} | ${id} |`)} ${title}`);

    videoInfo.depth = depth;
    this.videos.push(videoInfo);

    // drill down on each branch
    let allRecommendations: (IVideoRecommended | IVideo)[] = [];
    const currentVideoRecoms = videoInfo.recomendations?.slice(0, this.branching) ?? [];

    for (const recom of currentVideoRecoms) {
      const recommendations = await this.getReccommendationsFor(recom, depth + 1);
      allRecommendations = [...allRecommendations, ...recommendations];
    }

    return allRecommendations;
  }

  private getVideo = (id: string) => {
    const video = this.videos.find((video: IVideo) => video.id === id);
    return video;
  };

  //* Saving

  async save() {
    await this.saveToFile();

    if (!dbConnected) return;

    await this.saveCollectionToDB();
    for (const video of this.videos) {
      await this.saveToDB(video);
    }
  }

  //* Saving DB

  private async saveCollectionToDB() {
    const results = {
      keyword: this.name,
      date: this.date,
      videos: this.videos,
    };
    await YTRecommendations.save(results);
  }

  private async saveToDB(video: IVideo) {
    const isWatched = await YTVideoWatched.isWatchedToday(this.name, video.collectedAt);
    console.log('isWatched?', isWatched)
    if (isWatched) return;
    

    const ytVideo = await YTVideo.getVideo(video.id);
    if (!ytVideo) await this.saveVideoToDB(video);

    await this.saveVideoWatchedToDB(video);
  }

  private async saveVideoToDB(video: IVideo) {
    const { id, title, description, duration, hastags, uploadDate, datePublished, paid, channel } =
      video;

    const newVideo: IYTvideo = {
      id,
      title,
      description,
      duration,
      hastags: hastags as Types.Array<string>,
      uploadDate,
      datePublished,
      paid,
      channel,
    };

    return await YTVideo.save(newVideo);
  }

  private async saveVideoWatchedToDB(video: IVideo) {
    const { id, title, collectedAt, views, likes, comments, depth, recommended, recomendations } =
      video;

    const watched: IYTvideoWatched = {
      id,
      title,
      keyword: this.name,
      date: collectedAt,
      views: views ?? -1,
      likes: likes ?? -1,
      comments: comments ?? -1,
      depth,
      recommended,
      recommendations: recomendations as Types.DocumentArray<IVideoRecommended>,
    };

    return await YTVideoWatched.save(watched);
  }

  //* Saving file

  private async saveToFile() {
    const results = {
      keyword: this.name,
      date: this.date,
      videos: this.videos,
    };

    const folder = 'results';
    const file = `${this.name}-${this.date}.json`;
    await fs.outputJson(`${folder}/${file}`, results, { spaces: 2 });
  }
}

export default Scraper;
