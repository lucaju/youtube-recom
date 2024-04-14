import { Schema } from 'mongoose';
import type { Video } from 'youtube-recommendation-crawler/schema';

export const VideoDbSchema = new Schema<Video>(
  {
    id: { type: String, required: true },
    title: String,
    adCompanion: {
      domain: String,
      title: String,
    },
    channel: {
      id: String,
      name: String,
    },
    comments: Number,
    crawlerResults: {
      collectedAt: { type: Date, required: true },
      depth: Number,
      recommended: Number,
    },
    datePublished: Date,
    description: String,
    duration: String,
    hastags: [String],
    likes: Number,
    paid: Boolean,
    recommendations: [
      {
        ytId: String,
        title: String,
      },
    ],
    uploadDate: Date,
    views: Number,
  },
  { strict: false },
);
