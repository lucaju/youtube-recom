import { Schema } from 'mongoose';
import { CrawlerResult, crawlerConfig, type CrawlerConfig } from 'youtube-recommendation-crawler';
import { VideoDbSchema } from './videos';

export const CrawlerConfigDbSchema = new Schema<CrawlerConfig>(
  {
    seeds: { type: Number, min: 1, max: crawlerConfig.seeds.max, required: true },
    branches: { type: Number, min: 1, max: crawlerConfig.branches.max, required: true },
    depth: { type: Number, min: 0, max: crawlerConfig.depth.max, required: true, default: 0 },
    country: {
      type: String,
      match: [/^[A-Z]{2}$/, `{VALUE} is not a valid country code. e.g., 'CA' for Canada`],
    },
    language: {
      type: String,
      match: [
        /^[a-z]{2}-[A-Z]{2}$/,
        `{VALUE} is not a valid language code. e.g., 'en-CA' for English Canada`,
      ],
    },
  },
  { _id: false },
);

export const CrawlerResultDbSchema = new Schema<CrawlerResult>(
  {
    date: { type: Date, required: true },
    keyword: { type: String, required: true },
    videos: [{ type: VideoDbSchema }],
  },
  { _id: false },
);
