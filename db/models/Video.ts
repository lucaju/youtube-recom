import { Model, model, Schema } from 'mongoose';
import type { IYTvideo } from '../types';

export const VideoSchema = new Schema<IYTvideo, Model<IYTvideo>>(
  {
    ytId: { type: String, required: true },
    adCompanion: {
      domain: String,
      title: String,
    },
    channel: {
      id: String,
      name: String,
    },
    datePublished: Date,
    description: String,
    duration: String,
    hastags: [String],
    paid: { type: Boolean, default: false },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    title: String,
    uploadDate: Date,
    watched: [{ type: Schema.Types.ObjectId, ref: 'WatchedVideo' }],
  },
  { strict: false, timestamps: true }
);

export const VideoModel = model<IYTvideo, Model<IYTvideo>>('Video', VideoSchema);
