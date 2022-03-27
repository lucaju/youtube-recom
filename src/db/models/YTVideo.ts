import { Model, model, Schema } from 'mongoose';
import { IChannel, IYTvideo } from '../../types';

export const YTVideoSchema = new Schema<IYTvideo, Model<IYTvideo>>(
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
    watched: [{ type: Schema.Types.ObjectId, ref: 'Watched' }],
  },
  { strict: false, timestamps: true }
);

export const YTVideoModel = model<IYTvideo, Model<IYTvideo>>('YTVideos', YTVideoSchema);
