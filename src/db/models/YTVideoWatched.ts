import { Model, model, Schema } from 'mongoose';
import { IVideoRecommended, IYTvideoWatched } from '../../types';

export const YTVideoWatchedSchema = new Schema<IYTvideoWatched, Model<IYTvideoWatched>>(
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
      new Schema<IVideoRecommended>({
        id: String,
        title: String,
      }),
    ],
    // details: { type: Schema.Types.ObjectId, ref: 'YTVideo' },
  },
  { strict: false, timestamps: true }
);

YTVideoWatchedSchema.virtual('details', {
  ref: 'YTVideo',
  localField: 'id',
  foreignField: 'id',
});

export const YTVideoWatchedModel = model<IYTvideoWatched, Model<IYTvideoWatched>>(
  'YTVideosWatched',
  YTVideoWatchedSchema
);
