import { Schema } from 'mongoose';
import type { CrawlerConfig } from 'youtube-recommendation-crawler/schema';

export const CrawlerConfigDbSchema = new Schema<CrawlerConfig>(
  {
    seeds: { type: Number, min: 1, max: 5, required: true },
    branches: { type: Number, min: 1, max: 5, required: true },
    depth: { type: Number, min: 0, max: 5, required: true, default: 0 },
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
