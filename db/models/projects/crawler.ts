import { Schema } from 'mongoose';
import type { ICrawlerConfig } from '../../../crawler';
import { MAX_VALUES } from '../../../crawler';

export const CrawlerSchema = new Schema<ICrawlerConfig>(
  {
    keywords: [{ type: String, required: true }],
    seeds: {
      type: Number,
      min: [1, 'Min seeds is 1'],
      max: [MAX_VALUES.seeds, `Max seeds is ${MAX_VALUES.seeds}`],
      required: true,
    },
    branches: {
      type: Number,
      min: [1, 'Min branches is 1'],
      max: [MAX_VALUES.branches, `Max branches is ${MAX_VALUES.branches}`],
      required: true,
    },
    depth: {
      type: Number,
      min: [0, 'Min depth is 0'],
      max: [MAX_VALUES.depth, `Max depth is ${MAX_VALUES.depth}`],
      required: true,
      default: 0,
    },
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
  { _id: false }
);
