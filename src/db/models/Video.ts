import { Model, model, Schema } from 'mongoose';
import { IChannel, IYTvideo } from '../../types';

export const VideoSchema = new Schema<IYTvideo, Model<IYTvideo>>(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    description: String,
    duration: String,
    hastags: [String],
    paid: { type: Boolean, default: false },
    uploadDate: Date,
    datePublished: Date,
    channel: new Schema<IChannel>({
      id: String,
      name: String,
    }),
    watched: [{ type: Schema.Types.ObjectId, ref: 'WatchedVideos' }],
  },
  { strict: false, timestamps: true }
);

export const VideoModel = model<IYTvideo, Model<IYTvideo>>('Videos', VideoSchema);
