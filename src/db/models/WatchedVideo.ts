import { Model, model, Schema } from 'mongoose';
import { IRecommendedVideo, IWatched } from '../../types';

export const WatchedVideoSchema = new Schema<IWatched, Model<IWatched>>(
  {
    id: { type: String, required: true },
    title: String,
    keyword: { type: String, required: true },
    date: { type: Date, required: true },
    views: { type: Number, default: -1 },
    likes: { type: Number, default: -1 },
    comments: { type: Number, default: -1 },
    depth: { type: Number, default: 0 },
    recommended: Number,
    recommendations: [
      new Schema<IRecommendedVideo>({ id: String,
        title: String,
      }),
    ],
  },
  { strict: false, timestamps: true }
);

WatchedVideoSchema.virtual('details', {
  ref: 'Video',
  localField: 'id',
  foreignField: 'id',
});

export const WatchedVideoModel = model<IWatched, Model<IWatched>>(
  'WatchedVideos',
  WatchedVideoSchema
);
