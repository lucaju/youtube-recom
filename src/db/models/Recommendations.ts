import { model, Model, Schema } from 'mongoose';
import { IRecommendation } from '../../types';
import { VideoSchema } from './Video';

export const RecommendationSchema = new Schema<IRecommendation, Model<IRecommendation>>({
  keyword: { type: String, required: true },
  date: { type: Date, required: true },
  videos: [{ type: VideoSchema }],
}, { strict: false, timestamps: true });

export const RecommendationModel = model<IRecommendation, Model<IRecommendation>>(
  'Recommendations',
  RecommendationSchema
);
