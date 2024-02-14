import { Schema } from 'mongoose';
import type { IRecommendation } from '../types';
import type { IRecommendationModel } from './';
import { VideoSchema } from './videoSchema';

export const RecommendationSchema = new Schema<IRecommendation, IRecommendationModel>(
  {
    date: { type: Date, required: true },
    keyword: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    videos: [{ type: VideoSchema }],
  },
  { strict: false, timestamps: true },
);
