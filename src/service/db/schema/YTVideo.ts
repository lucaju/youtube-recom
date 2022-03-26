import { Model, Schema, Types } from 'mongoose';
import { IChannel, IVideoRecommended, YTVideo, YTVideoWatched } from '../../../types';

const YTVideoSchema = new Schema<YTVideo, Model<YTVideo>>(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    description: String,
    duration: String,
    hastags: [String],
    paid: { type: Boolean, default: false },
    uploadDate: Date,
    datePublished: Date,
    collectedAt: { type: Date, default: new Date() },
    channel: new Schema<IChannel>({
      id: String,
      name: String,
    }),
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    recommended: { type: Number, default: 0 },
    minDepth: { type: Number, default: 0 },

    //collected every time the video is recomended
    watched: [
      new Schema<YTVideoWatched>({
        id: {
          type: Schema.Types.ObjectId,
          ref: 'id',
          default: new Types.ObjectId(),
          required: false,
        },
        keyword: String, //seed searched keyword
        watchedAt: { type: Date, default: new Date() },

        // the corrent data the recommendation
        views: { type: Number, default: -1 },
        likes: { type: Number, default: -1 },
        comments: { type: Number, default: -1 },
        depth: { type: Number, default: 0 },
        recommended: Number,
        recommendations: [
          new Schema<IVideoRecommended>({
            id: String,
            title: String,
          }),
        ],
      }),
    ],
  },
  { strict: false }
);

export default YTVideoSchema;
