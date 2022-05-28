import { DateTime } from 'luxon';
import { Model, model } from 'mongoose';
import type { IRecommendation } from '../types';
import { RecommendationSchema } from './schema';

export interface IRecommendationModel extends Model<IRecommendation> {
  collectedKeywordAt(projectId: string, date: DateTime): Promise<boolean>;
}

RecommendationSchema.statics.collectedKeywordAt = async (projectId, date) => {
  const { year, month, day } = date;
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
    date: { $gte: start, $lte: end },
  });

  return !!recommendation;
};

export const RecommendationModel = model<IRecommendation, IRecommendationModel>(
  'Recommendation',
  RecommendationSchema
);
