import fs from 'fs-extra';
import kleur, { gray, magenta, red } from 'kleur';
import emoji from 'node-emoji';
import ora from 'ora';
import config from '../config.json';
import db from '../service/db';
import type { IVideo, IVideoRecommended, YTVideo, YTVideoWatched } from '../types';
import { searchResults } from './search';
import { watchPage } from './watch';
import { Types } from 'mongoose';

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

  async save() {
    await this.saveToFile();
    await this.saveCollectionToDB();

    for (const video of this.videos) {
      await this.saveToDB(video);
    }
  }

  private async saveCollectionToDB() {
    const results = {
      keyword: this.name,
      date: this.date,
      videos: this.videos,
    };
    await db.saveCollection(results);
  }

  private async saveToDB(video: IVideo) {
    let YTVideo = await db.getVideo(video.id);
    if (!YTVideo) {
      const newVideo: YTVideo = {
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        hastags: video.hastags,
        uploadDate: video.uploadDate,
        datePublished: video.datePublished,
        paid: video.paid,
        collectedAt: video.collectedAt,
        channel: video.channel,
        views: video.views ?? -1,
        likes: video.likes ?? -1,
        comments: video.comments ?? -1,
        recommended: video.recommended,
        minDepth: video.depth,
      };

      YTVideo = await db.saveVideo(newVideo);
    }

    const watched: YTVideoWatched = {
      keyword: this.name,
      watchedAt: video.collectedAt,
      views: video.views ?? -1,
      likes: video.likes ?? -1,
      comments: video.comments ?? -1,
      depth: video.depth,
      recommended: video.recommended,
      recommendations: video.recomendations as Types.DocumentArray<IVideoRecommended>,
    };

    await db.insertVideoWatch(video.id, watched);
  }

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
