import { DateTime } from 'luxon';
import { Model, model, Schema } from 'mongoose';
import type { IRecommendation } from '../types';
import { VideoSchema } from './Video';

interface IRecommendationModel extends Model<IRecommendation> {
  collectedKeywordAt(projectId: string, keyword: string, date: Date): Promise<boolean>;
}

export const RecommendationSchema = new Schema<IRecommendation, IRecommendationModel>(
  {
    date: { type: Date, required: true },
    keyword: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    videos: [{ type: VideoSchema }],
  },
  { strict: false, timestamps: true }
);

RecommendationSchema.statics.collectedKeywordAt = async (projectId, keyword, date) => {
  const {year, month, day} = DateTime.fromJSDate(date);
  const start = DateTime.fromObject({ year, month, day }).toISO();
  const end = DateTime.fromObject({
    year,
    month,
    day,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  }).toISO();

  const recommendation = await RecommendationModel.exists({
    project: projectId,
    keyword,
    date: { $gte: start, $lte: end },
  });

  return !!recommendation;
};

export const RecommendationModel = model<IRecommendation, IRecommendationModel>(
  'Recommendation',
  RecommendationSchema
);
